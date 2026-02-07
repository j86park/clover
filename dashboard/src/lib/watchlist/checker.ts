/**
 * Competitor Quick-Check Utility
 * Performs lightweight competitor analysis using minimal prompts
 */

import OpenAI from 'openai';
import type { QuickCheckResult } from '@/types';

// Lazy-load OpenAI client to avoid build-time initialization errors
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
    if (!openaiClient) {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openaiClient;
}

/**
 * Quick-check prompts for competitor analysis
 */
function getQuickCheckPrompts(competitorName: string, category: string): string[] {
    return [
        `What do you think of ${competitorName} as a ${category} solution?`,
        `Would you recommend ${competitorName} for someone looking for ${category}?`,
        `What are the main pros and cons of ${competitorName}?`,
    ];
}

/**
 * Analyze a single response for competitor mentions and sentiment
 */
function analyzeResponse(response: string, competitorName: string): {
    mentioned: boolean;
    sentiment: number;
    position: number | null;
} {
    const lowerResponse = response.toLowerCase();
    const lowerCompetitor = competitorName.toLowerCase();
    const mentioned = lowerResponse.includes(lowerCompetitor);

    if (!mentioned) {
        return { mentioned: false, sentiment: 0, position: null };
    }

    // Simple sentiment analysis based on keywords
    const positiveWords = ['excellent', 'great', 'best', 'recommend', 'love', 'amazing', 'fantastic', 'outstanding', 'superior', 'leading'];
    const negativeWords = ['poor', 'bad', 'avoid', 'worst', 'terrible', 'disappointing', 'lacks', 'expensive', 'outdated', 'limited'];

    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
        if (lowerResponse.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
        if (lowerResponse.includes(word)) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    const sentiment = total === 0 ? 0 : (positiveCount - negativeCount) / Math.max(total, 1);

    // Estimate position in response (earlier = higher visibility)
    const firstMention = lowerResponse.indexOf(lowerCompetitor);
    const position = firstMention === -1 ? null : Math.ceil((firstMention / response.length) * 100);

    return { mentioned, sentiment, position };
}

/**
 * Perform quick competitor check using lightweight prompts
 */
export async function quickCheckCompetitor(
    competitorName: string,
    category: string
): Promise<QuickCheckResult> {
    const prompts = getQuickCheckPrompts(competitorName, category);

    const results = await Promise.all(
        prompts.map(async (prompt) => {
            try {
                const completion = await getOpenAI().chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 500,
                    temperature: 0.7,
                });

                const response = completion.choices[0]?.message?.content || '';
                return analyzeResponse(response, competitorName);
            } catch (error) {
                console.error('Quick check prompt failed:', error);
                return { mentioned: false, sentiment: 0, position: null };
            }
        })
    );

    // Aggregate results
    const mentionedCount = results.filter(r => r.mentioned).length;
    const avgSentiment = results.reduce((sum, r) => sum + r.sentiment, 0) / results.length;

    // Calculate AIGVR (percentage of responses mentioning the competitor)
    const aigvr = (mentionedCount / prompts.length) * 100;

    // Calculate ASoV (simplified: based on average position when mentioned)
    const positionedResults = results.filter(r => r.position !== null);
    const avgPosition = positionedResults.length > 0
        ? positionedResults.reduce((sum, r) => sum + (100 - (r.position || 0)), 0) / positionedResults.length
        : 0;
    const asov = mentionedCount > 0 ? avgPosition * (aigvr / 100) : 0;

    return {
        asov: Math.round(asov * 10) / 10,
        aigvr: Math.round(aigvr * 10) / 10,
        sentiment: Math.round(avgSentiment * 100) / 100,
        checkedAt: new Date().toISOString(),
    };
}

/**
 * Determine trend direction based on previous value
 */
export function calculateTrend(
    currentValue: number,
    previousValue: number | null | undefined
): 'up' | 'down' | 'stable' {
    if (previousValue === null || previousValue === undefined) {
        return 'stable';
    }

    const diff = currentValue - previousValue;
    const threshold = 2; // 2% change threshold

    if (diff > threshold) return 'up';
    if (diff < -threshold) return 'down';
    return 'stable';
}
