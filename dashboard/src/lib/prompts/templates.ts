/**
 * Default Prompt Templates
 * These are used when no custom prompts are defined in the database
 */

export type PromptCategory = 'discovery' | 'comparison' | 'review' | 'purchasing' | 'trending';

export interface PromptTemplate {
    category: PromptCategory;
    intent: string;
    template: string;
    description: string;
}

export const DEFAULT_PROMPTS: PromptTemplate[] = [
    // ═══════════════════════════════════════════════════════════════
    // DISCOVERY PROMPTS — Finding best options in a category
    // ═══════════════════════════════════════════════════════════════
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
    {
        category: 'discovery',
        intent: 'top_rated_2025',
        template: 'What are the top-rated {category} tools in 2025?',
        description: 'Find highly-rated tools for current year',
    },
    {
        category: 'discovery',
        intent: 'best_for_startups',
        template: 'Which {category} solution is best for startups?',
        description: 'Startup-focused recommendation',
    },
    {
        category: 'discovery',
        intent: 'enterprise_tools',
        template: 'What {category} tools do enterprise companies use?',
        description: 'Enterprise-grade tool discovery',
    },
    {
        category: 'discovery',
        intent: 'small_team_recommendation',
        template: 'Recommend a {category} tool for small teams.',
        description: 'Small team focused recommendation',
    },

    // ═══════════════════════════════════════════════════════════════
    // COMPARISON PROMPTS — Comparing brands
    // ═══════════════════════════════════════════════════════════════
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
    {
        category: 'comparison',
        intent: 'choice_decision',
        template: 'Should I choose {brand} or {competitor} for {category}?',
        description: 'Decision-focused comparison',
    },
    {
        category: 'comparison',
        intent: 'key_differences',
        template: 'What are the key differences between {brand} and {competitor}?',
        description: 'Feature/capability differences',
    },
    {
        category: 'comparison',
        intent: 'cost_effectiveness',
        template: 'Which is more cost-effective: {brand} or {competitor}?',
        description: 'Price/value comparison',
    },
    {
        category: 'comparison',
        intent: 'beginner_friendly',
        template: 'Is {brand} better than {competitor} for beginners?',
        description: 'Ease of use for newcomers',
    },

    // ═══════════════════════════════════════════════════════════════
    // REVIEW PROMPTS — Evaluating specific brands
    // ═══════════════════════════════════════════════════════════════
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
    {
        category: 'review',
        intent: 'user_feedback',
        template: 'What do users say about {brand}?',
        description: 'User sentiment analysis',
    },
    {
        category: 'review',
        intent: 'price_worth',
        template: 'Is {brand} worth the price?',
        description: 'Value-for-money assessment',
    },
    {
        category: 'review',
        intent: 'common_complaints',
        template: 'What are common complaints about {brand}?',
        description: 'Known issues and complaints',
    },
    {
        category: 'review',
        intent: 'reliability_check',
        template: 'How reliable is {brand}?',
        description: 'Reliability and uptime assessment',
    },

    // ═══════════════════════════════════════════════════════════════
    // PURCHASING PROMPTS — Buying decision prompts
    // ═══════════════════════════════════════════════════════════════
    {
        category: 'purchasing',
        intent: 'buy_or_alternatives',
        template: 'Should I buy {brand} or look for alternatives?',
        description: 'Purchase decision guidance',
    },
    {
        category: 'purchasing',
        intent: 'best_value',
        template: 'Is {brand} the best value in {category}?',
        description: 'Value comparison in category',
    },
    {
        category: 'purchasing',
        intent: 'pre_purchase_considerations',
        template: 'What should I consider before purchasing {brand}?',
        description: 'Pre-purchase checklist',
    },
    {
        category: 'purchasing',
        intent: 'long_term_use',
        template: 'Is {brand} good for long-term use?',
        description: 'Long-term viability assessment',
    },

    // ═══════════════════════════════════════════════════════════════
    // TRENDING PROMPTS — Time-sensitive trend prompts
    // ═══════════════════════════════════════════════════════════════
    {
        category: 'trending',
        intent: 'most_talked_about',
        template: "What's the most talked about {category} tool right now?",
        description: 'Current hot topic in category',
    },
    {
        category: 'trending',
        intent: 'social_trending',
        template: 'Which {category} is trending on social media?',
        description: 'Social media trends',
    },
    {
        category: 'trending',
        intent: 'gaining_popularity',
        template: 'What {category} tools are gaining popularity?',
        description: 'Rising stars in category',
    },
    {
        category: 'trending',
        intent: 'whats_new',
        template: "What's new in the {category} space?",
        description: 'Recent developments and launches',
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

/**
 * Get all available categories
 */
export function getAllCategories(): PromptCategory[] {
    return ['discovery', 'comparison', 'review', 'purchasing', 'trending'];
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: PromptCategory): string {
    const names: Record<PromptCategory, string> = {
        discovery: 'Discovery',
        comparison: 'Comparison',
        review: 'Review',
        purchasing: 'Purchasing',
        trending: 'Trending',
    };
    return names[category];
}
