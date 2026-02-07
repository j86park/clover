/**
 * Prompt Effectiveness Analyzer
 * Analyzes which prompts generate the most favorable brand mentions
 */

import { createClient } from '@/lib/supabase/server';

export interface PromptEffectiveness {
    promptId: string;
    promptText: string;
    category: string;
    mentionCount: number;
    totalResponses: number;
    mentionRate: number; // 0-100 percentage
    avgSentiment: number; // -1 to 1
    lastCalculated: string;
}

export interface PromptEffectivenessSummary {
    prompts: PromptEffectiveness[];
    summary: {
        bestPrompt: { text: string; rate: number } | null;
        worstPrompt: { text: string; rate: number } | null;
        avgMentionRate: number;
    };
}

/**
 * Calculate prompt effectiveness metrics for a brand
 */
export async function calculatePromptEffectiveness(
    brandId: string
): Promise<PromptEffectiveness[]> {
    const supabase = await createClient();

    // Step 1: Get all responses for this brand's collections with prompt info
    const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select(`
      id,
      prompt_id,
      prompt_text,
      collection:collections!inner(brand_id)
    `)
        .eq('collections.brand_id', brandId);

    if (responsesError || !responses) {
        console.error('Failed to fetch responses:', responsesError);
        return [];
    }

    // Step 2: Get analysis data (mentions) for these responses
    const responseIds = responses.map((r: { id: string }) => r.id);
    if (responseIds.length === 0) {
        return [];
    }

    const { data: analyses, error: analysesError } = await supabase
        .from('analysis')
        .select('response_id, mentions')
        .in('response_id', responseIds);

    if (analysesError) {
        console.error('Failed to fetch analyses:', analysesError);
        return [];
    }

    // Step 3: Get brand name for mention matching
    const { data: brand } = await supabase
        .from('brands')
        .select('name')
        .eq('id', brandId)
        .single();

    const brandName = brand?.name?.toLowerCase() || '';

    // Step 4: Group responses by prompt and calculate metrics
    const promptMap = new Map<string, {
        promptId: string;
        promptText: string;
        category: string;
        responses: string[];
        mentions: number;
        sentiments: number[];
    }>();

    // Build prompt map from responses
    for (const response of responses) {
        const key = response.prompt_id || response.prompt_text.substring(0, 100);

        if (!promptMap.has(key)) {
            promptMap.set(key, {
                promptId: response.prompt_id || key,
                promptText: response.prompt_text,
                category: 'general', // Would need to join with prompts table for actual category
                responses: [],
                mentions: 0,
                sentiments: [],
            });
        }

        promptMap.get(key)!.responses.push(response.id);
    }

    // Process analyses to count brand mentions per prompt
    const analysisMap = new Map<string, { mentions: BrandMentionData[]; responseId: string }>();
    for (const analysis of analyses || []) {
        analysisMap.set(analysis.response_id, {
            mentions: analysis.mentions || [],
            responseId: analysis.response_id,
        });
    }

    // Calculate metrics for each prompt
    for (const [, promptData] of promptMap) {
        for (const responseId of promptData.responses) {
            const analysis = analysisMap.get(responseId);
            if (!analysis) continue;

            // Check if brand was mentioned
            const brandMention = analysis.mentions.find((m: BrandMentionData) =>
                m.brand_name?.toLowerCase().includes(brandName) ||
                brandName.includes(m.brand_name?.toLowerCase() || '')
            );

            if (brandMention) {
                promptData.mentions++;

                // Convert sentiment to numeric
                const sentimentValue =
                    brandMention.sentiment === 'positive' ? 1 :
                        brandMention.sentiment === 'negative' ? -1 : 0;
                promptData.sentiments.push(sentimentValue);
            }
        }
    }

    // Step 5: Transform to PromptEffectiveness array
    const results: PromptEffectiveness[] = [];

    for (const [, promptData] of promptMap) {
        const totalResponses = promptData.responses.length;
        const mentionRate = totalResponses > 0
            ? Math.round((promptData.mentions / totalResponses) * 1000) / 10
            : 0;

        const avgSentiment = promptData.sentiments.length > 0
            ? promptData.sentiments.reduce((a, b) => a + b, 0) / promptData.sentiments.length
            : 0;

        results.push({
            promptId: promptData.promptId,
            promptText: promptData.promptText,
            category: promptData.category,
            mentionCount: promptData.mentions,
            totalResponses,
            mentionRate,
            avgSentiment: Math.round(avgSentiment * 100) / 100,
            lastCalculated: new Date().toISOString(),
        });
    }

    return results;
}

/**
 * Get prompts ranked by mention rate (highest first)
 */
export async function getPromptRanking(
    brandId: string
): Promise<PromptEffectivenessSummary> {
    const prompts = await calculatePromptEffectiveness(brandId);

    // Sort by mention rate descending
    const sorted = [...prompts].sort((a, b) => b.mentionRate - a.mentionRate);

    // Calculate summary
    const avgMentionRate = prompts.length > 0
        ? prompts.reduce((sum, p) => sum + p.mentionRate, 0) / prompts.length
        : 0;

    const bestPrompt = sorted[0]
        ? { text: sorted[0].promptText.substring(0, 60), rate: sorted[0].mentionRate }
        : null;

    const worstPrompt = sorted.length > 1
        ? { text: sorted[sorted.length - 1].promptText.substring(0, 60), rate: sorted[sorted.length - 1].mentionRate }
        : null;

    return {
        prompts: sorted,
        summary: {
            bestPrompt,
            worstPrompt,
            avgMentionRate: Math.round(avgMentionRate * 10) / 10,
        },
    };
}

// Internal type for mention data from analysis
interface BrandMentionData {
    brand_name?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    context?: string;
    is_recommended?: boolean;
    position?: number;
}
