/**
 * Prompt Instance Generator
 * Generates all prompt instances for a collection run
 */

import { renderPrompt, extractVariables } from '@/lib/prompts/engine';
import type { Brand, Competitor, Prompt } from '@/types';

export interface PromptInstance {
    promptId: string;
    promptText: string;
    variables: Record<string, string>;
    category: string;
    intent: string;
}

/**
 * Generate all prompt instances for a brand and its competitors
 */
export function generatePromptInstances(
    brand: Brand,
    competitors: Competitor[],
    prompts: Prompt[]
): PromptInstance[] {
    const instances: PromptInstance[] = [];

    // Extract category from brand keywords or use a default
    const category = brand.keywords?.[0] || 'software';

    for (const prompt of prompts) {
        if (!prompt.is_active) continue;

        const templateVars = extractVariables(prompt.template);
        const needsCompetitor = templateVars.includes('competitor');

        if (needsCompetitor) {
            if (competitors.length === 0) {
                console.warn(`[Generator] Skipping prompt "${prompt.intent}" (ID: ${prompt.id}) because it requires competitors but brand has none.`);
                continue;
            }
            // Generate one instance per competitor
            for (const competitor of competitors) {
                const variables = {
                    brand: brand.name,
                    category,
                    competitor: competitor.name,
                };

                instances.push({
                    promptId: prompt.id,
                    promptText: renderPrompt(prompt.template, variables),
                    variables,
                    category: prompt.category,
                    intent: prompt.intent,
                });
            }
        } else {
            // Generate single instance for this prompt
            const variables = {
                brand: brand.name,
                category,
            };

            instances.push({
                promptId: prompt.id,
                promptText: renderPrompt(prompt.template, variables),
                variables,
                category: prompt.category,
                intent: prompt.intent,
            });
        }
    }

    return instances;
}

/**
 * Calculate total expected responses for a collection
 */
export function calculateTotalResponses(
    promptInstances: PromptInstance[],
    modelCount: number
): number {
    return promptInstances.length * modelCount;
}
