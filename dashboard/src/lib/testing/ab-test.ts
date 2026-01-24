/**
 * A/B Content Test Framework
 * Run experiments with different prompts/content to measure performance
 */

import { createClient } from '@/lib/supabase/server';
import { analyzeResponse } from '@/lib/analysis/analyzer';
import { calculateASoV, calculateSentimentScore } from '@/lib/metrics/calculators';
import { queryLLM } from '@/lib/openrouter/client';
import type { ABTestConfig, ABTestResult, ABComparison } from '@/types/testing';

/**
 * Initialize a new A/B test
 */
export async function createABTest(config: ABTestConfig): Promise<string> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('ab_tests') // Assuming table exists or using generic 'tests' table
        .insert({
            name: config.name,
            config: config,
            status: 'pending',
            created_at: new Date().toISOString()
        })
        .select('id')
        .single();

    if (error) throw new Error(`Failed to create test: ${error.message}`);
    return data.id;
}

/**
 * Run an A/B test
 * Executes each variant across specified models
 */
export async function runABTest(testId: string): Promise<ABTestResult[]> {
    const supabase = await createClient();

    // 1. Fetch test config
    const { data: test, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('id', testId)
        .single();

    if (error || !test) throw new Error('Test not found');

    const config = test.config as ABTestConfig;
    const results: ABTestResult[] = [];

    // 2. Update status
    await supabase.from('ab_tests').update({ status: 'running' }).eq('id', testId);

    // 3. Run execution loop
    try {
        for (const variant of config.variants) {
            let totalMentions = 0;
            let totalRecs = 0;
            let positiveSentiment = 0;
            let totalSentiment = 0;

            // For each iteration/sample
            const iterations = config.iterations || 10;
            const models = config.models || ['openai/gpt-4o-mini'];

            for (let i = 0; i < iterations; i++) {
                // Pick a model round-robin
                const model = models[i % models.length];

                // Create prompt from template + variant content
                const prompt = config.promptTemplate.replace('{{content}}', variant.content);

                // Run LLM
                try {
                    const llmResult = await queryLLM(model, [{ role: 'user', content: prompt }]);

                    // Analyze response
                    const analysis = await analyzeResponse(llmResult.content, {
                        trackedBrand: 'MyBrand', // Ideally this comes from config
                    });

                    // Aggregate metrics
                    const mentions = analysis.mentions.filter(m => m.brand_name.toLowerCase() === 'mybrand'); // Placeholder logic
                    if (mentions.length > 0) {
                        totalMentions++;
                        if (mentions.some(m => m.is_recommended)) totalRecs++;

                        mentions.forEach(m => {
                            if (m.sentiment === 'positive') positiveSentiment++;
                            totalSentiment++;
                        });
                    }
                } catch (e) {
                    console.error(`Variant ${variant.id} run ${i} failed:`, e);
                }
            }

            results.push({
                testId,
                variantId: variant.id,
                metrics: {
                    mentions: totalMentions,
                    recommendations: totalRecs,
                    asoV: calculateASoV(totalMentions, iterations * 5), // Approx defaults
                    sentimentScore: calculateSentimentScore(
                        positiveSentiment,
                        totalSentiment - positiveSentiment, // assuming remaining are neutral/neg
                        0 // simplified
                    )
                },
                samples: iterations
            });
        }

        // 4. Save results
        await supabase
            .from('ab_tests')
            .update({
                status: 'completed',
                results: results,
                completed_at: new Date().toISOString()
            })
            .eq('id', testId);

        return results;

    } catch (e) {
        await supabase.from('ab_tests').update({ status: 'failed' }).eq('id', testId);
        throw e;
    }
}

/**
 * Compare variants using Chi-square test for conversion rates (recommendations)
 */
export function compareVariants(results: ABTestResult[]): ABComparison {
    if (results.length < 2) throw new Error('Need at least 2 results to compare');

    const baseline = results[0]; // Assume first is baseline/control
    const comparisons = [];

    for (let i = 1; i < results.length; i++) {
        const variant = results[i];

        // Calculate lift in recommendations
        const baselineRate = baseline.metrics.recommendations / baseline.samples;
        const variantRate = variant.metrics.recommendations / variant.samples;

        const improvement = baselineRate === 0
            ? (variantRate > 0 ? 100 : 0)
            : ((variantRate - baselineRate) / baselineRate) * 100;

        // Simple Chi-Square for p-value (2x2 contingency table)
        // [Recs, NoRecs]
        // [Reference, Variant]
        const a = baseline.metrics.recommendations;
        const b = baseline.samples - a;
        const c = variant.metrics.recommendations;
        const d = variant.samples - c;

        const n = a + b + c + d;
        const pValue = calculateChiSquare(a, b, c, d, n);

        comparisons.push({
            variantId: variant.variantId,
            improvement,
            statisticalSignificance: pValue,
            confidenceInterval: [0, 0] as [number, number] // specific calc omitted for brevity
        });
    }

    return {
        testId: baseline.testId,
        baselineId: baseline.variantId,
        comparisons
    };
}

/**
 * Helper: simple Chi-Square calculator for 2x2 table
 */
function calculateChiSquare(a: number, b: number, c: number, d: number, n: number): number {
    const numer = n * Math.pow(Math.abs(a * d - b * c) - n / 2, 2);
    const denom = (a + b) * (c + d) * (a + c) * (b + d);
    if (denom === 0) return 1;
    const chi2 = numer / denom;

    // Approx p-value from Chi2 (1 degree of freedom)
    // Table lookup
    if (chi2 > 10.83) return 0.001;
    if (chi2 > 6.63) return 0.01;
    if (chi2 > 3.84) return 0.05;
    if (chi2 > 2.71) return 0.10;
    return 0.50;
}
