/**
 * Content Gap Analysis
 * Identifies topics/prompts where competitors are mentioned but the user's brand is not
 */

import { createServerClient } from '@/lib/supabase';
import type { BrandMention } from '@/types/analysis';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CompetitorMentionCount {
    name: string;
    count: number;
}

export interface ContentGap {
    topic: string;
    promptCategory: string;
    competitorMentions: CompetitorMentionCount[];
    userMentions: number;
    gapScore: number;
    examplePrompts: string[];
}

export interface ContentGapResult {
    gaps: ContentGap[];
    brandName: string;
    totalGapsFound: number;
    generatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Extract topic from prompt text using simple keyword matching
 */
function extractTopicFromPrompt(promptText: string): string {
    // Common topic indicators
    const topicPatterns = [
        /(?:best|top|recommend|suggest)\s+(.+?)(?:\s+for|\s+to|\s+in|\?|$)/i,
        /(?:what|which|who)\s+(?:is|are)\s+(?:the\s+)?(?:best|top)?\s*(.+?)(?:\?|$)/i,
        /(?:compare|vs|versus|or)\s+(.+?)(?:\?|$)/i,
        /(.+?)\s+(?:alternatives?|options?|solutions?|tools?|software|services?)/i,
    ];

    for (const pattern of topicPatterns) {
        const match = promptText.match(pattern);
        if (match && match[1]) {
            // Clean and limit topic length
            const topic = match[1].trim().slice(0, 50);
            if (topic.length > 3) {
                return topic;
            }
        }
    }

    // Fallback: first 50 chars of prompt
    return promptText.slice(0, 50).replace(/\?.*$/, '').trim();
}

/**
 * Categorize a prompt into a general category
 */
function categorizePrompt(promptText: string): string {
    const text = promptText.toLowerCase();

    if (text.includes('compare') || text.includes('vs') || text.includes('versus')) {
        return 'Comparison';
    }
    if (text.includes('best') || text.includes('top') || text.includes('recommend')) {
        return 'Recommendation';
    }
    if (text.includes('how to') || text.includes('tutorial') || text.includes('guide')) {
        return 'How-To';
    }
    if (text.includes('what is') || text.includes('explain') || text.includes('define')) {
        return 'Educational';
    }
    if (text.includes('review') || text.includes('opinion') || text.includes('experience')) {
        return 'Review';
    }
    if (text.includes('alternative') || text.includes('instead of') || text.includes('replace')) {
        return 'Alternatives';
    }
    if (text.includes('price') || text.includes('cost') || text.includes('pricing')) {
        return 'Pricing';
    }

    return 'General';
}

// ═══════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Analyze content gaps between user brand and competitors
 * @param brandId - The user's brand ID
 * @param competitorIds - Array of competitor brand IDs (optional)
 * @returns Sorted list of content gaps (highest gap score first)
 */
export async function analyzeContentGaps(
    brandId: string,
    competitorIds?: string[]
): Promise<ContentGapResult> {
    const supabase = await createServerClient();

    // 1. Get brand info
    const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('id, name')
        .eq('id', brandId)
        .single();

    if (brandError || !brand) {
        console.error('Error fetching brand:', brandError);
        return {
            gaps: [],
            brandName: 'Unknown',
            totalGapsFound: 0,
            generatedAt: new Date().toISOString(),
        };
    }

    // 2. Get all responses with their analysis for collections owned by this brand
    const { data: collections } = await supabase
        .from('collections')
        .select('id')
        .eq('brand_id', brandId)
        .eq('status', 'completed');

    if (!collections || collections.length === 0) {
        return {
            gaps: [],
            brandName: brand.name,
            totalGapsFound: 0,
            generatedAt: new Date().toISOString(),
        };
    }

    const collectionIds = collections.map((c: { id: string }) => c.id);

    // 3. Get responses with analysis for these collections
    const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select(`
            id,
            prompt_text,
            collection_id,
            analysis!inner(mentions)
        `)
        .in('collection_id', collectionIds);

    if (responsesError || !responses || responses.length === 0) {
        return {
            gaps: [],
            brandName: brand.name,
            totalGapsFound: 0,
            generatedAt: new Date().toISOString(),
        };
    }

    // 4. Aggregate mentions by topic
    type TopicData = {
        topic: string;
        category: string;
        userMentions: number;
        competitorMentions: Map<string, number>;
        prompts: string[];
    };

    const topicMap = new Map<string, TopicData>();

    for (const response of responses) {
        const promptText = response.prompt_text || '';
        const topic = extractTopicFromPrompt(promptText);
        const category = categorizePrompt(promptText);

        // Get or create topic entry
        if (!topicMap.has(topic)) {
            topicMap.set(topic, {
                topic,
                category,
                userMentions: 0,
                competitorMentions: new Map(),
                prompts: [],
            });
        }

        const topicData = topicMap.get(topic)!;

        // Add example prompt (limit to 3)
        if (topicData.prompts.length < 3 && promptText) {
            topicData.prompts.push(promptText.slice(0, 100));
        }

        // Process mentions from analysis
        const analysis = Array.isArray(response.analysis) ? response.analysis[0] : response.analysis;
        const mentions: BrandMention[] = analysis?.mentions || [];

        for (const mention of mentions) {
            const mentionName = mention.brand_name?.toLowerCase() || '';
            const brandName = brand.name.toLowerCase();

            if (mentionName.includes(brandName) || brandName.includes(mentionName)) {
                // User brand mention
                topicData.userMentions++;
            } else {
                // Competitor mention
                const competitorName = mention.brand_name || 'Unknown';
                const currentCount = topicData.competitorMentions.get(competitorName) || 0;
                topicData.competitorMentions.set(competitorName, currentCount + 1);
            }
        }
    }

    // 5. Calculate gaps and filter
    const gaps: ContentGap[] = [];

    for (const [, topicData] of topicMap) {
        const totalCompetitorMentions = Array.from(topicData.competitorMentions.values())
            .reduce((sum, count) => sum + count, 0);

        // Only include if there's a gap (competitors mentioned more than user)
        if (totalCompetitorMentions > topicData.userMentions) {
            const competitorArray: CompetitorMentionCount[] = Array.from(topicData.competitorMentions.entries())
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            gaps.push({
                topic: topicData.topic,
                promptCategory: topicData.category,
                competitorMentions: competitorArray,
                userMentions: topicData.userMentions,
                gapScore: totalCompetitorMentions - topicData.userMentions,
                examplePrompts: topicData.prompts,
            });
        }
    }

    // 6. Sort by gap score (highest first)
    gaps.sort((a, b) => b.gapScore - a.gapScore);

    return {
        gaps: gaps.slice(0, 50), // Limit to top 50
        brandName: brand.name,
        totalGapsFound: gaps.length,
        generatedAt: new Date().toISOString(),
    };
}
