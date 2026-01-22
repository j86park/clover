/**
 * Brand Analyzer
 * Uses LLM to extract brands and sentiment from text
 */

import { queryLLM } from '@/lib/openrouter/client';
import { createExtractionPrompt } from './prompts';
import type { BrandMention, AnalyzeOptions, LLMExtractionResult } from '@/types/analysis';

const ANALYSIS_MODEL = 'openai/gpt-4o-mini';

/**
 * Parse JSON from LLM response, handling markdown code blocks
 */
function parseJsonResponse(text: string): unknown {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
    }

    return JSON.parse(cleaned.trim());
}

/**
 * Validate extraction result structure
 */
function validateExtractionResult(data: unknown): LLMExtractionResult {
    if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid response: not an object');
    }

    const result = data as Record<string, unknown>;

    if (!Array.isArray(result.mentions)) {
        throw new Error('Invalid response: mentions is not an array');
    }

    const mentions: BrandMention[] = result.mentions.map((m: unknown, index: number) => {
        const mention = m as Record<string, unknown>;
        return {
            brand_name: String(mention.brand_name || ''),
            context: String(mention.context || ''),
            is_recommended: Boolean(mention.is_recommended),
            sentiment: (['positive', 'neutral', 'negative'].includes(String(mention.sentiment))
                ? String(mention.sentiment)
                : 'neutral') as 'positive' | 'neutral' | 'negative',
            position: Number(mention.position) || index + 1,
        };
    });

    return {
        mentions,
        summary: String(result.summary || ''),
    };
}

/**
 * Analyze text to extract brand mentions and sentiment
 */
export async function analyzeBrands(
    responseText: string,
    options: AnalyzeOptions
): Promise<BrandMention[]> {
    const result = await analyzeResponse(responseText, options);
    return result.mentions;
}

/**
 * Full response analysis - extracts brands, sentiment, and summary
 */
export async function analyzeResponse(
    responseText: string,
    options: AnalyzeOptions
): Promise<LLMExtractionResult> {
    const { trackedBrand } = options;

    // Skip empty or very short responses
    if (!responseText || responseText.length < 20) {
        return { mentions: [], summary: 'Response too short to analyze' };
    }

    const prompts = createExtractionPrompt(responseText, trackedBrand);

    try {
        const result = await queryLLM(ANALYSIS_MODEL, [
            { role: 'system', content: prompts.system },
            { role: 'user', content: prompts.user },
        ], {
            temperature: 0.1, // Low temperature for consistent extraction
            maxTokens: 2048,
        });

        const parsed = parseJsonResponse(result.content);
        return validateExtractionResult(parsed);
    } catch (error) {
        console.error('Brand analysis failed:', error);
        return { mentions: [], summary: 'Analysis failed' };
    }
}

/**
 * Check if a specific brand is mentioned and recommended
 */
export function isBrandRecommended(
    mentions: BrandMention[],
    brandName: string
): { mentioned: boolean; recommended: boolean; sentiment: string | null } {
    const normalizedBrand = brandName.toLowerCase();
    const mention = mentions.find(m =>
        m.brand_name.toLowerCase() === normalizedBrand ||
        m.brand_name.toLowerCase().includes(normalizedBrand)
    );

    if (!mention) {
        return { mentioned: false, recommended: false, sentiment: null };
    }

    return {
        mentioned: true,
        recommended: mention.is_recommended,
        sentiment: mention.sentiment,
    };
}
