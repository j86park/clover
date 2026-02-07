/**
 * Alert Evaluator
 * Compares current metrics with previous metrics to determine if alerts should trigger
 */

import type { Metrics } from '@/types';
import type { AlertTriggers, AlertTriggerResult, AlertTriggerType } from '@/types/alerts';

export interface EvaluationContext {
    brandName: string;
    currentMetrics: Metrics;
    previousMetrics: Metrics;
    triggers: AlertTriggers;
}

/**
 * Evaluate all configured triggers against metric changes
 */
export function evaluateAlerts(context: EvaluationContext): AlertTriggerResult[] {
    const results: AlertTriggerResult[] = [];
    const { currentMetrics, previousMetrics, triggers, brandName } = context;

    // Check ASoV drop
    if (triggers.asov_drop_percent && triggers.asov_drop_percent > 0) {
        const result = checkAsovDrop(
            currentMetrics.asov,
            previousMetrics.asov,
            triggers.asov_drop_percent,
            brandName
        );
        if (result) results.push(result);
    }

    // Check competitor overtake
    if (triggers.competitor_overtake) {
        const result = checkCompetitorOvertake(
            currentMetrics.asov,
            previousMetrics.asov,
            brandName
        );
        if (result) results.push(result);
    }

    // Check sentiment turning negative
    if (triggers.sentiment_negative) {
        const result = checkSentimentNegative(
            currentMetrics.sentiment_score,
            previousMetrics.sentiment_score,
            brandName
        );
        if (result) results.push(result);
    }

    // Check new citation source
    if (triggers.new_citation_source) {
        const result = checkNewCitations(
            currentMetrics,
            previousMetrics,
            brandName
        );
        if (result) results.push(result);
    }

    return results;
}

/**
 * Check if ASoV dropped by more than the threshold percentage
 */
function checkAsovDrop(
    current: number,
    previous: number,
    threshold: number,
    brandName: string
): AlertTriggerResult | null {
    if (previous <= 0) return null; // Can't calculate drop from 0

    const dropPercent = ((previous - current) / previous) * 100;

    if (dropPercent >= threshold) {
        return {
            type: 'asov_drop',
            message: `${brandName}'s AI Share of Voice dropped by ${dropPercent.toFixed(1)}% (threshold: ${threshold}%). Previous: ${previous.toFixed(1)}%, Current: ${current.toFixed(1)}%.`,
            current_value: current,
            previous_value: previous,
            threshold,
        };
    }
    return null;
}

/**
 * Check if brand's ASoV dropped below 50% (overtaken by competitors)
 */
function checkCompetitorOvertake(
    current: number,
    previous: number,
    brandName: string
): AlertTriggerResult | null {
    // Simple check: if ASoV was >= 50% and now < 50%, competitors have overtaken
    if (previous >= 50 && current < 50) {
        return {
            type: 'competitor_overtake',
            message: `${brandName} has been overtaken by competitors! AI Share of Voice dropped from ${previous.toFixed(1)}% to ${current.toFixed(1)}%.`,
            current_value: current,
            previous_value: previous,
        };
    }
    return null;
}

/**
 * Check if sentiment turned from positive/neutral to negative
 */
function checkSentimentNegative(
    current: number,
    previous: number,
    brandName: string
): AlertTriggerResult | null {
    // Sentiment scale: -1 to 1, where < 0 is negative
    if (previous >= 0 && current < 0) {
        return {
            type: 'sentiment_negative',
            message: `${brandName}'s sentiment has turned negative. Score changed from ${previous.toFixed(2)} to ${current.toFixed(2)}.`,
            current_value: current,
            previous_value: previous,
        };
    }
    return null;
}

/**
 * Check for significant changes in citation metrics
 */
function checkNewCitations(
    current: Metrics,
    previous: Metrics,
    brandName: string
): AlertTriggerResult | null {
    const currentTotal = current.owned_citations + current.earned_citations + current.external_citations;
    const previousTotal = previous.owned_citations + previous.earned_citations + previous.external_citations;

    // Alert if citations increased significantly (more than 20%)
    if (previousTotal > 0 && currentTotal > previousTotal * 1.2) {
        return {
            type: 'new_citation_source',
            message: `${brandName} gained significant new citations! Total citations increased from ${previousTotal} to ${currentTotal}.`,
            current_value: currentTotal,
            previous_value: previousTotal,
        };
    }
    return null;
}

/**
 * Format trigger type for display
 */
export function formatTriggerType(type: AlertTriggerType): string {
    const labels: Record<AlertTriggerType, string> = {
        asov_drop: 'ASoV Drop',
        competitor_overtake: 'Competitor Overtake',
        sentiment_negative: 'Negative Sentiment',
        new_citation_source: 'New Citations',
    };
    return labels[type] || type;
}
