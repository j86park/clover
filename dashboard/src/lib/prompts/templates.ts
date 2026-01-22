/**
 * Default Prompt Templates
 * These are used when no custom prompts are defined in the database
 */

export type PromptCategory = 'discovery' | 'comparison' | 'review';

export interface PromptTemplate {
    category: PromptCategory;
    intent: string;
    template: string;
    description: string;
}

export const DEFAULT_PROMPTS: PromptTemplate[] = [
    // Discovery prompts - finding best options in a category
    {
        category: 'discovery',
        intent: 'best_in_category',
        template: 'What is the best {category} software or tool available today? Please provide your top recommendation with reasons.',
        description: 'Find the best tool in a category',
    },
    {
        category: 'discovery',
        intent: 'category_leaders',
        template: 'Who are the top 5 companies or products in the {category} space? Please list them with brief descriptions.',
        description: 'Identify market leaders in a category',
    },
    {
        category: 'discovery',
        intent: 'category_for_use_case',
        template: 'What {category} solution would you recommend for a growing business? Consider ease of use, pricing, and features.',
        description: 'Category recommendation for specific use case',
    },

    // Comparison prompts - comparing brands
    {
        category: 'comparison',
        intent: 'brand_vs_competitor',
        template: 'Compare {brand} vs {competitor}. Which one is better and why? Consider features, pricing, ease of use, and customer support.',
        description: 'Direct comparison between two brands',
    },
    {
        category: 'comparison',
        intent: 'brand_alternatives',
        template: 'What are the best alternatives to {brand}? Please list the top 5 alternatives with their key advantages.',
        description: 'Find alternatives to a specific brand',
    },
    {
        category: 'comparison',
        intent: 'brand_vs_category',
        template: 'How does {brand} compare to other solutions in the {category} market? What makes it stand out or fall behind?',
        description: 'Compare brand against category competition',
    },

    // Review prompts - evaluating specific brands
    {
        category: 'review',
        intent: 'brand_review',
        template: 'What are the pros and cons of {brand}? Please provide an honest assessment of its strengths and weaknesses.',
        description: 'Balanced review of a brand',
    },
    {
        category: 'review',
        intent: 'brand_recommendation',
        template: 'Would you recommend {brand} for a business? Who is it best suited for and who should avoid it?',
        description: 'Recommendation assessment',
    },
    {
        category: 'review',
        intent: 'brand_reputation',
        template: 'What is the general reputation of {brand} in the industry? What do customers typically say about it?',
        description: 'Brand reputation check',
    },
];

/**
 * Get prompts filtered by category
 */
export function getPromptsByCategory(category: PromptCategory): PromptTemplate[] {
    return DEFAULT_PROMPTS.filter(p => p.category === category);
}

/**
 * Get a specific prompt by intent
 */
export function getPromptByIntent(intent: string): PromptTemplate | undefined {
    return DEFAULT_PROMPTS.find(p => p.intent === intent);
}
