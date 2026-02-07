import { inngest } from "../client";
import { createServiceClient } from "@/lib/supabase/service";
import { queryLLM } from "@/lib/openrouter/client";
import { AVAILABLE_MODELS, type ModelKey } from "@/lib/openrouter/models";
import { generatePromptInstances } from "@/lib/collector/generator";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";
import { runMetricsPipeline } from "@/lib/metrics/pipeline";
import { evaluateAlerts, sendEmailAlert } from "@/lib/alerts";
import type { Brand, Prompt, Competitor, Metrics } from "@/types";
import type { AlertConfigRow, AlertTriggerResult } from "@/types/alerts";

interface DBBrand extends Brand {
    competitors: Competitor[];
}

export const collectionStart = inngest.createFunction(
    { id: "collection-start", name: "Start Data Collection" },
    { event: "collection.start" },
    async ({ event, step }) => {
        const { brandId, models, promptIds, collectionId: existingCollectionId } = event.data;
        const supabase = createServiceClient();

        // 1. Get or Create collection record
        const collection = await step.run("initialize-collection", async () => {
            // If we already have an ID (from the server action), just fetch it
            if (existingCollectionId) {
                const { data, error } = await supabase
                    .from('collections')
                    .select('*')
                    .eq('id', existingCollectionId)
                    .single();
                if (data) return data;
            }

            // Otherwise, create a new one (legacy/fallback)
            const { data, error } = await supabase
                .from('collections')
                .insert({
                    brand_id: brandId,
                    status: 'running',
                    started_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error || !data) throw new Error("Failed to create collection");
            return data;
        });

        const collectionId = collection.id;

        try {
            // 2. Load context data
            const context = await step.run("load-context", async () => {
                const { data: brand, error: brandError } = await supabase
                    .from('brands')
                    .select(`*, competitors (*)`)
                    .eq('id', brandId)
                    .single();

                if (brandError || !brand) throw new Error("Brand not found");

                const typedBrand = brand as DBBrand;

                let promptQuery = supabase
                    .from('prompts')
                    .select('*')
                    .eq('is_active', true);

                if (promptIds && promptIds.length > 0) {
                    promptQuery = promptQuery.in('id', promptIds);
                }

                const { data: prompts, error: promptError } = await promptQuery;
                if (promptError || !prompts || prompts.length === 0) {
                    throw new Error("No active prompts found");
                }

                return {
                    brand: typedBrand,
                    prompts: prompts as Prompt[]
                };
            });

            // 3. Generate instances
            const promptInstances = generatePromptInstances(
                context.brand,
                context.brand.competitors || [],
                context.prompts
            );

            // 4. Execute Queries as child steps
            // This is the "Hardening" - each LLM call is a step.
            // If one fails, the job can retry just that step.
            let completed = 0;
            let failed = 0;

            for (const instance of promptInstances) {
                for (const modelKey of (models as ModelKey[])) {
                    const modelConfig = AVAILABLE_MODELS[modelKey];
                    if (!modelConfig) continue;

                    await step.run(`query-${modelKey}-${instance.promptId.slice(0, 8)}`, async () => {
                        const startTime = Date.now();
                        const result = await queryLLM(modelConfig.id, [
                            { role: 'user', content: instance.promptText },
                        ]);

                        const latencyMs = Date.now() - startTime;

                        // Store response
                        const { error } = await supabase.from('responses').insert({
                            collection_id: collectionId,
                            prompt_id: instance.promptId,
                            model: modelKey,
                            prompt_text: instance.promptText,
                            response_text: result.content,
                            tokens_used: result.usage?.total_tokens || null,
                            latency_ms: latencyMs,
                        });

                        if (error) throw error;
                    });
                    completed++;
                }
            }

            // 5. Run Analysis Pipeline
            await step.run("analyze-data", async () => {
                return await runAnalysisPipeline({
                    collectionId,
                    trackedBrand: context.brand.name,
                    brandDomain: context.brand.domain ?? undefined,
                    supabase: supabase
                });
            });

            // 6. Run Metrics Pipeline
            await step.run("calculate-metrics", async () => {
                return await runMetricsPipeline(collectionId, supabase);
            });

            // 7. Evaluate and Send Alerts
            await step.run("evaluate-alerts", async () => {
                // Get active alert configs for this brand
                const { data: alertConfigs } = await supabase
                    .from('alerts')
                    .select('*')
                    .eq('brand_id', brandId)
                    .eq('is_active', true);

                if (!alertConfigs || alertConfigs.length === 0) {
                    console.log('[Alerts] No active alerts for this brand');
                    return { triggered: 0 };
                }

                // Get current collection's metrics (just calculated)
                const { data: currentMetricsData } = await supabase
                    .from('metrics')
                    .select('*')
                    .eq('collection_id', collectionId)
                    .eq('brand_id', brandId)
                    .single();

                if (!currentMetricsData) {
                    console.log('[Alerts] No current metrics found');
                    return { triggered: 0 };
                }

                // Get the previous collection's metrics for comparison
                const { data: previousCollections } = await supabase
                    .from('collections')
                    .select('id')
                    .eq('brand_id', brandId)
                    .eq('status', 'completed')
                    .neq('id', collectionId)
                    .order('completed_at', { ascending: false })
                    .limit(1);

                let previousMetrics: Metrics | null = null;
                if (previousCollections && previousCollections.length > 0) {
                    const { data: prevMetricsData } = await supabase
                        .from('metrics')
                        .select('*')
                        .eq('collection_id', previousCollections[0].id)
                        .eq('brand_id', brandId)
                        .single();
                    previousMetrics = prevMetricsData as Metrics | null;
                }

                if (!previousMetrics) {
                    console.log('[Alerts] No previous metrics to compare against');
                    return { triggered: 0 };
                }

                let triggeredCount = 0;

                for (const config of alertConfigs as AlertConfigRow[]) {
                    const triggers = evaluateAlerts({
                        brandName: context.brand.name,
                        currentMetrics: currentMetricsData as Metrics,
                        previousMetrics,
                        triggers: config.triggers,
                    });

                    if (triggers.length > 0) {
                        // Send email
                        const result = await sendEmailAlert({
                            to: config.destination,
                            brandName: context.brand.name,
                            triggers,
                        });

                        // Log the alert
                        for (const trigger of triggers) {
                            await supabase.from('alert_logs').insert({
                                alert_config_id: config.id,
                                trigger_type: trigger.type,
                                message: trigger.message,
                                status: result.success ? 'sent' : 'failed',
                                error_message: result.error || null,
                            });
                        }

                        // Update last triggered timestamp
                        await supabase
                            .from('alerts')
                            .update({ last_triggered_at: new Date().toISOString() })
                            .eq('id', config.id);

                        triggeredCount += triggers.length;
                    }
                }

                return { triggered: triggeredCount };
            });

            // 8. Finalize
            await step.run("finalize-collection", async () => {
                await supabase
                    .from('collections')
                    .update({
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                    })
                    .eq('id', collectionId);
            });

            return { success: true, collectionId, completed };

        } catch (error) {
            await step.run("mark-failed", async () => {
                await supabase
                    .from('collections')
                    .update({
                        status: 'failed',
                        completed_at: new Date().toISOString(),
                    })
                    .eq('id', collectionId);
            });
            throw error;
        }
    }
);

