/**
 * Metrics Calculators
 * Core calculation functions for ASoV, AIGVR, Authority, and Sentiment
 */

/**
 * Calculate Answer Share of Voice (ASoV)
 * Measures what percentage of all brand mentions belong to a specific brand
 * @returns 0-100 percentage
 */
export function calculateASoV(
    brandMentions: number,
    totalMentions: number
): number {
    if (totalMentions === 0) return 0;
    return Math.round((brandMentions / totalMentions) * 10000) / 100;
}

/**
 * Calculate Weighted ASoV
 * Recommendations count 2x, regular mentions 1x
 * @returns 0-100 percentage
 */
export function calculateWeightedASoV(
    brandRecommendations: number,
    brandMentions: number,
    totalMentions: number,
    totalRecommendations: number
): number {
    if (totalMentions === 0 && totalRecommendations === 0) return 0;

    // Weighted: recommendations count double
    const brandWeight = brandMentions + brandRecommendations;
    const totalWeight = totalMentions + totalRecommendations;

    if (totalWeight === 0) return 0;
    return Math.round((brandWeight / totalWeight) * 10000) / 100;
}

/**
 * Calculate AI-Generated Visibility Rate (AIGVR)
 * Measures in what percentage of responses a brand appears at all
 * @returns 0-100 percentage
 */
export function calculateAIGVR(
    responsesWithBrand: number,
    totalResponses: number
): number {
    if (totalResponses === 0) return 0;
    return Math.round((responsesWithBrand / totalResponses) * 10000) / 100;
}

/**
 * Calculate Source Authority Score
 * Based on citation source types: owned (3), earned (2), external (1)
 * @returns 1-3 score
 */
export function calculateAuthorityScore(
    ownedCount: number,
    earnedCount: number,
    externalCount: number
): number {
    const total = ownedCount + earnedCount + externalCount;
    if (total === 0) return 1;

    const weightedSum = (ownedCount * 3) + (earnedCount * 2) + (externalCount * 1);
    return Math.round((weightedSum / total) * 100) / 100;
}

/**
 * Calculate Sentiment Score
 * Converts sentiment counts to -1 to 1 scale
 * @returns -1 (all negative) to 1 (all positive)
 */
export function calculateSentimentScore(
    positive: number,
    neutral: number,
    negative: number
): number {
    const total = positive + neutral + negative;
    if (total === 0) return 0;

    // positive = +1, neutral = 0, negative = -1
    const score = (positive * 1 + neutral * 0 + negative * -1) / total;
    return Math.round(score * 1000) / 1000;
}

/**
 * Calculate Recommendation Rate
 * Percentage of mentions where the brand is recommended
 * @returns 0-100 percentage
 */
export function calculateRecommendationRate(
    recommendations: number,
    totalMentions: number
): number {
    if (totalMentions === 0) return 0;
    return Math.round((recommendations / totalMentions) * 10000) / 100;
}
