/**
 * LLM-as-a-Judge Scoring Module
 * Evaluates response quality using an LLM judge
 */

import { queryLLM } from '@/lib/openrouter/client';
import { createJudgePrompt, JUDGE_SYSTEM_PROMPT } from './prompts';
import type { JudgeScore, JudgeCriteria } from '@/types/testing';

const JUDGE_MODEL = 'openai/gpt-4o-mini';

/**
 * Clean and parse JSON from LLM response
 */
function parseJudgeResponse(text: string): JudgeScore {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith('```')) {
        cleanText = cleanText.slice(0, -3);
    }

    try {
        const parsed = JSON.parse(cleanText);
        return {
            relevance: Number(parsed.relevance) || 0,
            accuracy: Number(parsed.accuracy) || 0,
            completeness: Number(parsed.completeness) || 0,
            reasoning: String(parsed.reasoning || 'No reasoning provided'),
            overall_score: Number(parsed.overall_score) || 0
        };
    } catch (e) {
        console.error('Failed to parse judge response:', text);
        throw new Error('Invalid JSON response from judge');
    }
}

/**
 * Evaluate a single response against criteria
 */
export async function evaluateResponse(
    response: string,
    input: string,
    criteria: JudgeCriteria = { relevance: true, accuracy: true, completeness: true },
    expectedOutput?: string | string[]
): Promise<JudgeScore> {
    const prompt = createJudgePrompt(response, input, criteria, expectedOutput);

    try {
        const result = await queryLLM(JUDGE_MODEL, [
            { role: 'system', content: JUDGE_SYSTEM_PROMPT },
            { role: 'user', content: prompt }
        ], {
            temperature: 0.1, // Low temperature for consistent scoring
            maxTokens: 1024
        });

        return parseJudgeResponse(result.content);
    } catch (error) {
        console.error('Judge evaluation failed:', error);
        return {
            relevance: 0,
            accuracy: 0,
            completeness: 0,
            reasoning: `Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            overall_score: 0
        };
    }
}

/**
 * Quick helper to just get a semantic relevance score
 */
export async function scoreSemanticRelevance(
    response: string,
    input: string
): Promise<number> {
    const result = await evaluateResponse(response, input, { relevance: true });
    return result.relevance;
}
