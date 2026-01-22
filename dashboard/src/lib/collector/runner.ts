/**
 * Collection Runner
 * Orchestrates LLM queries with rate limiting
 */

import pLimit from 'p-limit';
import { createClient } from '@/lib/supabase/server';
import { queryLLM } from '@/lib/openrouter/client';
import { AVAILABLE_MODELS, type ModelKey } from '@/lib/openrouter/models';
import { generatePromptInstances, type PromptInstance } from './generator';
import type { Brand, Competitor, Prompt } from '@/types';

export interface CollectionConfig {
    brandId: string;
    models: ModelKey[];
    promptIds?: string[];
    concurrency?: number;
}

export interface CollectionResult {
    collectionId: string;
    totalPrompts: number;
    completed: number;
    failed: number;
    status: 'completed' | 'failed' | 'partial';
}

interface DBBrand extends Brand {
    competitors: Competitor[];
}

/**
 * Run a complete data collection for a brand
 */
export async function runCollection(
    config: CollectionConfig
): Promise<CollectionResult> {
    const { brandId, models, promptIds, concurrency = 3 } = config;
    const supabase = await createClient();

    // 1. Create collection record
    const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .insert({
            brand_id: brandId,
            status: 'running',
            started_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (collectionError || !collection) {
        throw new Error('Failed to create collection record');
    }

    const collectionId = collection.id;

    try {
        // 2. Load brand with competitors
        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select(`*, competitors (*)`)
            .eq('id', brandId)
            .single();

        if (brandError || !brand) {
            throw new Error('Brand not found');
        }

        const typedBrand = brand as DBBrand;

        // 3. Load prompts
        let promptQuery = supabase
            .from('prompts')
            .select('*')
            .eq('is_active', true);

        if (promptIds && promptIds.length > 0) {
            promptQuery = promptQuery.in('id', promptIds);
        }

        const { data: prompts, error: promptError } = await promptQuery;

        if (promptError) {
            throw new Error('Failed to load prompts');
        }

        // If no prompts in DB, we can't run collection
        if (!prompts || prompts.length === 0) {
            throw new Error('No active prompts found. Please add prompts first.');
        }

        // 4. Generate prompt instances
        const promptInstances = generatePromptInstances(
            typedBrand,
            typedBrand.competitors || [],
            prompts as Prompt[]
        );

        // 5. Execute with rate limiting
        const limit = pLimit(concurrency);
        let completed = 0;
        let failed = 0;

        const tasks: Promise<void>[] = [];

        for (const instance of promptInstances) {
            for (const modelKey of models) {
                const modelConfig = AVAILABLE_MODELS[modelKey];
                if (!modelConfig) continue;

                const task = limit(async () => {
                    const startTime = Date.now();

                    try {
                        const result = await queryLLM(modelConfig.id, [
                            { role: 'user', content: instance.promptText },
                        ]);

                        const latencyMs = Date.now() - startTime;

                        // Store response
                        await supabase.from('responses').insert({
                            collection_id: collectionId,
                            prompt_id: instance.promptId,
                            model: modelKey,
                            prompt_text: instance.promptText,
                            response_text: result.content,
                            tokens_used: result.usage?.total_tokens || null,
                            latency_ms: latencyMs,
                        });

                        completed++;
                    } catch (error) {
                        console.error(`Failed to query ${modelKey}:`, error);
                        failed++;
                    }
                });

                tasks.push(task);
            }
        }

        await Promise.all(tasks);

        // 6. Update collection status
        const finalStatus = failed === 0 ? 'completed' :
            completed === 0 ? 'failed' : 'completed';

        await supabase
            .from('collections')
            .update({
                status: finalStatus,
                completed_at: new Date().toISOString(),
            })
            .eq('id', collectionId);

        return {
            collectionId,
            totalPrompts: promptInstances.length * models.length,
            completed,
            failed,
            status: finalStatus as CollectionResult['status'],
        };
    } catch (error) {
        // Mark collection as failed
        await supabase
            .from('collections')
            .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', collectionId);

        throw error;
    }
}
