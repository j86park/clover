/**
 * Analysis Pipeline
 * Orchestrates brand extraction, citation parsing, and storage
 */

import pLimit from 'p-limit';
import { createClient } from '@/lib/supabase/server';
import { analyzeResponse } from './analyzer';
import { extractUrls } from './citations';
import { classifySource, type ClassificationContext } from './classifier';
import type { BrandMention, Citation, AnalyzeOptions } from '@/types/analysis';

export interface PipelineConfig {
    collectionId: string;
    brandDomain?: string;
    competitorDomains?: string[];
    trackedBrand?: string;
    concurrency?: number;
    supabase?: any;
}

export interface PipelineResult {
    analyzed: number;
    failed: number;
    totalMentions: number;
    totalCitations: number;
}

interface ResponseToAnalyze {
    id: string;
    response_text: string;
    prompt_text: string;
}

/**
 * Run analysis pipeline for a collection
 */
export async function runAnalysisPipeline(
    config: PipelineConfig
): Promise<PipelineResult> {
    const {
        collectionId,
        brandDomain,
        competitorDomains = [],
        trackedBrand,
        concurrency = 2
    } = config;

    const supabase = config.supabase || await createClient();

    // Load responses for collection
    const { data: responses, error } = await supabase
        .from('responses')
        .select('id, response_text, prompt_text')
        .eq('collection_id', collectionId);

    if (error || !responses) {
        throw new Error(`Failed to load responses: ${error?.message}`);
    }

    if (responses.length === 0) {
        return { analyzed: 0, failed: 0, totalMentions: 0, totalCitations: 0 };
    }

    const limit = pLimit(concurrency);
    let analyzed = 0;
    let failed = 0;
    let totalMentions = 0;
    let totalCitations = 0;

    const classificationContext: ClassificationContext = {
        brandDomain,
        competitorDomains,
    };

    const analyzeOptions: AnalyzeOptions = {
        trackedBrand: trackedBrand || '',
        brandDomain,
        competitors: [],
        competitorDomains,
    };

    const tasks = responses.map((response: ResponseToAnalyze) =>
        limit(async () => {
            try {
                // 1. Run LLM brand extraction
                const extractionResult = await analyzeResponse(
                    response.response_text,
                    analyzeOptions
                );

                // 2. Extract citations
                const extractedUrls = extractUrls(response.response_text);
                const citations: Citation[] = extractedUrls.map(url => ({
                    url: url.url,
                    domain: url.domain,
                    source_type: classifySource(url.domain, classificationContext),
                }));

                // 3. Store analysis result
                const { error: insertError } = await supabase
                    .from('analysis')
                    .insert({
                        response_id: response.id,
                        mentions: extractionResult.mentions,
                        citations,
                        summary: extractionResult.summary,
                        analyzed_at: new Date().toISOString(),
                    });

                if (insertError) {
                    console.error('Failed to store analysis:', insertError);
                    failed++;
                    return;
                }

                analyzed++;
                totalMentions += extractionResult.mentions.length;
                totalCitations += citations.length;
            } catch (error) {
                console.error('Analysis failed for response:', response.id, error);
                failed++;
            }
        })
    );

    await Promise.all(tasks);

    return {
        analyzed,
        failed,
        totalMentions,
        totalCitations,
    };
}

/**
 * Analyze a single response (for testing/debugging)
 */
export async function analyzeSingleResponse(
    responseId: string,
    config: Omit<PipelineConfig, 'collectionId'>
): Promise<{ mentions: BrandMention[]; citations: Citation[]; summary: string }> {
    const supabase = await createClient();

    const { data: response, error } = await supabase
        .from('responses')
        .select('response_text')
        .eq('id', responseId)
        .single();

    if (error || !response) {
        throw new Error('Response not found');
    }

    const analyzeOptions: AnalyzeOptions = {
        trackedBrand: config.trackedBrand || '',
        brandDomain: config.brandDomain,
        competitorDomains: config.competitorDomains,
    };

    const extractionResult = await analyzeResponse(response.response_text, analyzeOptions);

    const extractedUrls = extractUrls(response.response_text);
    const citations: Citation[] = extractedUrls.map(url => ({
        url: url.url,
        domain: url.domain,
        source_type: classifySource(url.domain, {
            brandDomain: config.brandDomain,
            competitorDomains: config.competitorDomains,
        }),
    }));

    return {
        mentions: extractionResult.mentions,
        citations,
        summary: extractionResult.summary,
    };
}
