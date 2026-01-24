/**
 * Correlation Calculator
 * Statistical functions for analyzing relationship between mentions and performance
 */

import type { CorrelationResult } from '@/types/testing';

/**
 * Calculate Pearson Correlation Coefficient (r)
 * Measures linear correlation between two sets of data.
 * @returns -1 to 1, or 0 if insufficient data
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;

    return Math.round((numerator / denominator) * 1000) / 1000;
}

/**
 * Calculate Spearman Rank Correlation
 * Measures monotonic relationship (better for non-linear data)
 */
export function calculateSpearmanCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;

    // Convert to ranks
    const rankX = getRanks(x);
    const rankY = getRanks(y);

    // Calculate d^2
    const sumD2 = rankX.reduce((sum, rx, i) => {
        const d = rx - rankY[i];
        return sum + d * d;
    }, 0);

    const rho = 1 - (6 * sumD2) / (n * (n * n - 1));
    return Math.round(rho * 1000) / 1000;
}

function getRanks(arr: number[]): number[] {
    const sorted = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(arr.length);

    for (let i = 0; i < sorted.length; i++) {
        // Handle ties by averaging ranks
        let j = i;
        while (j < sorted.length - 1 && sorted[j + 1].v === sorted[j].v) {
            j++;
        }

        const rank = (i + j + 2) / 2; // 1-based rank average
        for (let k = i; k <= j; k++) {
            ranks[sorted[k].i] = rank;
        }
        i = j;
    }

    return ranks;
}

/**
 * Calculate statistical significance (p-value approximation)
 * Uses t-distribution for Pearson/Spearman
 */
export function calculateSignificance(r: number, n: number): number {
    if (n < 3 || Math.abs(r) >= 1) return 0;

    const t = Math.abs(r) * Math.sqrt((n - 2) / (1 - r * r));

    // Very logical approximation for p-value from t-score
    // Using a simplified lookup since we can't import big stat libraries
    if (t > 3.291) return 0.001;
    if (t > 2.576) return 0.01;
    if (t > 1.960) return 0.05;
    if (t > 1.645) return 0.10;

    return 0.20; // Not significant
}

/**
 * Analyze correlation between brand mentions and external metric
 */
export function analyzeCorrelation(
    mentions: number[],
    externalMetric: number[],
    metricName: 'search_volume' | 'traffic' | 'sales'
): { pearson: number; spearman: number; significance: number; sampleSize: number } {
    const n = Math.min(mentions.length, externalMetric.length);
    const x = mentions.slice(0, n);
    const y = externalMetric.slice(0, n);

    const pearson = calculatePearsonCorrelation(x, y);
    const spearman = calculateSpearmanCorrelation(x, y);
    const significance = calculateSignificance(pearson, n);

    return {
        pearson,
        spearman,
        significance,
        sampleSize: n
    };
}
