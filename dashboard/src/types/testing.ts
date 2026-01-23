/**
 * Testing Framework Types
 * Definitions for LLM-as-a-Judge, A/B testing, and correlation analysis
 */

import type { BrandMention, Citation } from './analysis';

// --- Core Testing Types ---

export interface TestCase {
    id: string;
    name: string;
    description?: string;
    input: string; // The prompt or context being tested
    expectedOutput?: string | string[]; // Expected strings to be present
    criteria?: Record<string, unknown>; // Flexible criteria for judge cards
    created_at: string;
}

export interface TestResult {
    id: string;
    test_id: string;
    passed: boolean;
    score: number; // 0-100 normalized score
    details: Record<string, unknown>; // Detailed failure/success reasons
    timestamp: string;
}

// --- LLM-as-a-Judge Types ---

export interface JudgeCriteria {
    relevance?: boolean; // Is the answer relevant to the user's intent?
    accuracy?: boolean;  // Are the facts stated correct?
    completeness?: boolean; // Does it cover all required aspects?
    tone?: 'professional' | 'casual' | 'salesy' | 'neutral';
}

export interface JudgeScore {
    relevance: number; // 0-100
    accuracy: number;  // 0-100
    completeness: number; // 0-100
    reasoning: string; // LLM's explanation for the score
    overall_score: number; // Computed average
}

// --- A/B Testing Types ---

export interface ABVariant {
    id: string;
    name: string;
    content: string; // The prompt template or content being tested
    metadata?: Record<string, unknown>;
}

export interface ABTestConfig {
    id: string;
    name: string;
    variants: ABVariant[];
    promptTemplate: string; // Base template with {{variable}} support
    models: string[]; // List of LLM models to test against
    iterations: number; // How many times to run each variant
    sampleSize?: number; // Calculated total runs
}

export interface ABTestResult {
    testId: string;
    variantId: string;
    metrics: {
        mentions: number;
        recommendations: number;
        asoV: number;
        sentimentScore: number;
    };
    samples: number;
}

export interface ABComparison {
    testId: string;
    baselineId: string;
    comparisons: {
        variantId: string;
        improvement: number; // Percentage change vs baseline
        statisticalSignificance: number; // p-value
        confidenceInterval: [number, number];
    }[];
}

// --- Correlation Analysis Types ---

export interface CorrelationDataPoint {
    date: string;
    brandMentions: number;
    searchVolume: number;
}

export interface CorrelationResult {
    brandId: string;
    metric: 'asoV' | 'mentions';
    pearsonCorrelation: number; // -1 to 1
    spearmanCorrelation: number; // Rank correlation
    sampleSize: number;
    significance: number; // p-value
    startDate: string;
    endDate: string;
}

// --- Validation Reports ---

export interface ValidationReport {
    id: string;
    timestamp: string;
    summary: {
        totalTests: number;
        passed: number;
        failed: number;
        healthScore: number; // 0-100
    };
    sections: {
        judge?: TestResult[];
        abTests?: ABTestResult[];
        correlations?: CorrelationResult[];
    };
    recommendations: string[];
}
