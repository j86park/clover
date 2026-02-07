/**
 * Recommendations Module
 * Exports the recommendations engine and related utilities
 */

export {
    generateRecommendations,
    getRecommendationsForUser,
} from './engine';

export type {
    Recommendation,
    RecommendationsResult,
    RecommendationPriority,
    RecommendationType,
} from './engine';

export {
    RECOMMENDATION_RULES,
} from './rules';

export type {
    RecommendationRule,
} from './rules';
