/**
 * Prompt Builder Wizard Utility
 * Helps non-technical users construct effective prompts via guided steps
 */

import { PromptCategory } from './templates';

// ═══════════════════════════════════════════════════════════════
// WIZARD CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const PROMPT_CATEGORIES: { value: PromptCategory; label: string; description: string }[] = [
    { value: 'discovery', label: 'Discovery', description: 'Find the best options in a category' },
    { value: 'comparison', label: 'Comparison', description: 'Compare brands head-to-head' },
    { value: 'review', label: 'Review', description: 'Evaluate a specific brand' },
    { value: 'purchasing', label: 'Purchasing', description: 'Help with buying decisions' },
    { value: 'trending', label: 'Trending', description: 'Find what\'s popular right now' },
];

export const INTENT_TYPES: Record<PromptCategory, { value: string; label: string }[]> = {
    discovery: [
        { value: 'best_in_category', label: 'Best in Category' },
        { value: 'category_leaders', label: 'Market Leaders' },
        { value: 'best_for_startups', label: 'Best for Startups' },
        { value: 'enterprise_tools', label: 'Enterprise Tools' },
        { value: 'small_team_recommendation', label: 'Small Team Pick' },
    ],
    comparison: [
        { value: 'brand_vs_competitor', label: 'Head-to-Head Comparison' },
        { value: 'brand_alternatives', label: 'Find Alternatives' },
        { value: 'key_differences', label: 'Key Differences' },
        { value: 'cost_effectiveness', label: 'Cost Comparison' },
        { value: 'beginner_friendly', label: 'Beginner-Friendly Check' },
    ],
    review: [
        { value: 'brand_review', label: 'Pros and Cons' },
        { value: 'brand_recommendation', label: 'Should I Use It?' },
        { value: 'brand_reputation', label: 'Reputation Check' },
        { value: 'user_feedback', label: 'User Sentiment' },
        { value: 'common_complaints', label: 'Known Issues' },
    ],
    purchasing: [
        { value: 'buy_or_alternatives', label: 'Buy or Look Elsewhere' },
        { value: 'best_value', label: 'Best Value Check' },
        { value: 'pre_purchase_considerations', label: 'What to Consider' },
        { value: 'long_term_use', label: 'Long-Term Viability' },
    ],
    trending: [
        { value: 'most_talked_about', label: 'Most Talked About' },
        { value: 'social_trending', label: 'Social Media Trends' },
        { value: 'gaining_popularity', label: 'Rising Stars' },
        { value: 'whats_new', label: 'What\'s New' },
    ],
};

export const TONE_OPTIONS = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-oriented' },
    { value: 'casual', label: 'Casual', description: 'Friendly and approachable' },
    { value: 'technical', label: 'Technical', description: 'Detailed and spec-focused' },
    { value: 'concise', label: 'Concise', description: 'Brief and to-the-point' },
];

export const OUTPUT_FORMATS = [
    { value: 'paragraph', label: 'Paragraph', description: 'Flowing prose' },
    { value: 'bullet_list', label: 'Bullet List', description: 'Easy-to-scan points' },
    { value: 'comparison_table', label: 'Comparison Table', description: 'Side-by-side features' },
    { value: 'ranked_list', label: 'Ranked List', description: 'Numbered top picks' },
];

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface PromptBuilderState {
    category: PromptCategory | null;
    intent: string | null;
    brandName: string;
    competitorNames: string[];
    includeComparison: boolean;
    tone: string;
    outputFormat: string;
    customInstructions: string;
}

export const DEFAULT_BUILDER_STATE: PromptBuilderState = {
    category: null,
    intent: null,
    brandName: '',
    competitorNames: [],
    includeComparison: false,
    tone: 'professional',
    outputFormat: 'paragraph',
    customInstructions: '',
};

export type VariationType = 'tone' | 'length' | 'focus';

// ═══════════════════════════════════════════════════════════════
// PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * Build a prompt template from wizard state
 */
export function buildPromptFromWizard(state: PromptBuilderState): string {
    const { category, intent, brandName, competitorNames, includeComparison, tone, outputFormat, customInstructions } = state;

    if (!category || !intent) {
        return '';
    }

    // Base prompt structure varies by category
    let prompt = '';

    switch (category) {
        case 'discovery':
            prompt = buildDiscoveryPrompt(intent, brandName);
            break;
        case 'comparison':
            prompt = buildComparisonPrompt(intent, brandName, competitorNames, includeComparison);
            break;
        case 'review':
            prompt = buildReviewPrompt(intent, brandName);
            break;
        case 'purchasing':
            prompt = buildPurchasingPrompt(intent, brandName);
            break;
        case 'trending':
            prompt = buildTrendingPrompt(intent);
            break;
    }

    // Add tone modifier
    if (tone !== 'professional') {
        const toneDescriptions: Record<string, string> = {
            casual: 'Please use a friendly, conversational tone.',
            technical: 'Please include technical details and specifications.',
            concise: 'Please keep your response brief and to the point.',
        };
        if (toneDescriptions[tone]) {
            prompt += ` ${toneDescriptions[tone]}`;
        }
    }

    // Add output format instruction
    const formatInstructions: Record<string, string> = {
        bullet_list: 'Please format your response as a bullet list.',
        comparison_table: 'Please present your comparison in a table format.',
        ranked_list: 'Please provide a ranked list with your top picks.',
    };
    if (formatInstructions[outputFormat]) {
        prompt += ` ${formatInstructions[outputFormat]}`;
    }

    // Add custom instructions
    if (customInstructions.trim()) {
        prompt += ` Additional context: ${customInstructions.trim()}`;
    }

    return prompt;
}

function buildDiscoveryPrompt(intent: string, brandName: string): string {
    const templates: Record<string, string> = {
        best_in_category: `What is the best {category} software or tool available today? Please provide your top recommendation with reasons.`,
        category_leaders: `Who are the top 5 companies or products in the {category} space? Please list them with brief descriptions.`,
        best_for_startups: `Which {category} solution is best for startups?`,
        enterprise_tools: `What {category} tools do enterprise companies use?`,
        small_team_recommendation: `Recommend a {category} tool for small teams.`,
    };
    return templates[intent] || templates.best_in_category;
}

function buildComparisonPrompt(intent: string, brandName: string, competitors: string[], includeComparison: boolean): string {
    const competitor = competitors.length > 0 ? competitors[0] : '{competitor}';

    const templates: Record<string, string> = {
        brand_vs_competitor: `Compare ${brandName || '{brand}'} vs ${competitor}. Which one is better and why? Consider features, pricing, ease of use, and customer support.`,
        brand_alternatives: `What are the best alternatives to ${brandName || '{brand}'}? Please list the top 5 alternatives with their key advantages.`,
        key_differences: `What are the key differences between ${brandName || '{brand}'} and ${competitor}?`,
        cost_effectiveness: `Which is more cost-effective: ${brandName || '{brand}'} or ${competitor}?`,
        beginner_friendly: `Is ${brandName || '{brand}'} better than ${competitor} for beginners?`,
    };
    return templates[intent] || templates.brand_vs_competitor;
}

function buildReviewPrompt(intent: string, brandName: string): string {
    const brand = brandName || '{brand}';
    const templates: Record<string, string> = {
        brand_review: `What are the pros and cons of ${brand}? Please provide an honest assessment of its strengths and weaknesses.`,
        brand_recommendation: `Would you recommend ${brand} for a business? Who is it best suited for and who should avoid it?`,
        brand_reputation: `What is the general reputation of ${brand} in the industry? What do customers typically say about it?`,
        user_feedback: `What do users say about ${brand}?`,
        common_complaints: `What are common complaints about ${brand}?`,
    };
    return templates[intent] || templates.brand_review;
}

function buildPurchasingPrompt(intent: string, brandName: string): string {
    const brand = brandName || '{brand}';
    const templates: Record<string, string> = {
        buy_or_alternatives: `Should I buy ${brand} or look for alternatives?`,
        best_value: `Is ${brand} the best value in {category}?`,
        pre_purchase_considerations: `What should I consider before purchasing ${brand}?`,
        long_term_use: `Is ${brand} good for long-term use?`,
    };
    return templates[intent] || templates.buy_or_alternatives;
}

function buildTrendingPrompt(intent: string): string {
    const templates: Record<string, string> = {
        most_talked_about: `What's the most talked about {category} tool right now?`,
        social_trending: `Which {category} is trending on social media?`,
        gaining_popularity: `What {category} tools are gaining popularity?`,
        whats_new: `What's new in the {category} space?`,
    };
    return templates[intent] || templates.most_talked_about;
}

// ═══════════════════════════════════════════════════════════════
// A/B VARIANT GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * Generate an A/B variant of a base prompt
 */
export function generateABVariant(basePrompt: string, variationType: VariationType): string {
    switch (variationType) {
        case 'tone':
            return generateToneVariant(basePrompt);
        case 'length':
            return generateLengthVariant(basePrompt);
        case 'focus':
            return generateFocusVariant(basePrompt);
        default:
            return basePrompt;
    }
}

function generateToneVariant(basePrompt: string): string {
    // Make it more casual/conversational
    const casualPrefixes = [
        'Hey, quick question: ',
        'I\'m curious - ',
        'Can you help me out? ',
    ];
    const prefix = casualPrefixes[Math.floor(Math.random() * casualPrefixes.length)];
    return prefix + basePrompt.charAt(0).toLowerCase() + basePrompt.slice(1);
}

function generateLengthVariant(basePrompt: string): string {
    // Add request for more detail
    const detailSuffixes = [
        ' Please provide a detailed analysis with specific examples.',
        ' Be thorough and include all relevant factors.',
        ' Give me a comprehensive answer with pros, cons, and recommendations.',
    ];
    const suffix = detailSuffixes[Math.floor(Math.random() * detailSuffixes.length)];
    return basePrompt + suffix;
}

function generateFocusVariant(basePrompt: string): string {
    // Add a different focus angle
    const focusAdditions = [
        ' Focus especially on pricing and value for money.',
        ' Pay particular attention to ease of use and learning curve.',
        ' Emphasize reliability and customer support quality.',
    ];
    const addition = focusAdditions[Math.floor(Math.random() * focusAdditions.length)];
    return basePrompt + addition;
}

/**
 * Get available variation types with descriptions
 */
export function getVariationTypes(): { value: VariationType; label: string; description: string }[] {
    return [
        { value: 'tone', label: 'Tone Variation', description: 'More casual/conversational version' },
        { value: 'length', label: 'Detail Level', description: 'Request more thorough response' },
        { value: 'focus', label: 'Focus Shift', description: 'Emphasize different aspects' },
    ];
}
