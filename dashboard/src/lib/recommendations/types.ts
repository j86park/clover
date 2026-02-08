/**
 * Recommendations Types
 * Shared types for the recommendations module
 */

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationType = 'content' | 'competitive' | 'reputation' | 'visibility' | 'success';

export interface Recommendation {
    id: string;
    type: RecommendationType;
    priority: RecommendationPriority;
    title: string;
    description: string;
    action: string;
    reason: string;
    metrics: {
        current: number;
        target: number;
        unit: string;
    };
}

export interface RecommendationsResult {
    recommendations: Recommendation[];
    brandName: string;
    generatedAt: string;
}
