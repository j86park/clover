import { inngest } from "../client";
import { createClient } from "@/lib/supabase/server";
import { queryLLM } from "@/lib/openrouter/client";
import { AVAILABLE_MODELS, type ModelKey } from "@/lib/openrouter/models";
import { generatePromptInstances } from "@/lib/collector/generator";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";
import { runMetricsPipeline } from "@/lib/metrics/pipeline";
import type { Brand, Prompt, Competitor } from "@/types";

interface DBBrand extends Brand {
    competitors: Competitor[];
}

export const collectionStart = inngest.createFunction(
    { id: "collection-start", name: "Start Data Collection" },
    { event: "collection.start" },
    async ({ event, step }) => {
        const { brandId, models, promptIds } = event.data;
        const supabase = await createClient();

        // 1. Create collection record (Step ensures this is tracked)
        const collection = await step.run("initialize-collection", async () => {
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

            // 7. Finalize
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
