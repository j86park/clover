/**
 * Correlation Test Runner
 * Runs analysis comparing internal brand mentions vs external data
 */

import { createClient } from '@/lib/supabase/server';
import { analyzeCorrelation } from './correlation';
import type { CorrelationResult, CorrelationDataPoint } from '@/types/testing';

export interface CorrelationTestConfig {
    brandId: string;
    startDate: string;
    endDate: string;
    externalData: { date: string; value: number }[];
    metricName: 'search_volume' | 'traffic' | 'sales';
}

/**
 * Run a correlation test
 */
export async function runCorrelationTest(
    config: CorrelationTestConfig
): Promise<CorrelationResult> {
    const supabase = await createClient();

    // 1. Fetch analysis data from Supabase
    const { data: analysisData, error } = await supabase
        .from('analysis')
        .select(`
            analyzed_at,
            mentions
        `)
        .gte('analyzed_at', config.startDate)
        .lte('analyzed_at', config.endDate);

    if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`);
    if (!analysisData || analysisData.length === 0) {
        throw new Error('No analysis data found for the specified date range');
    }

    // 2. Aggregate mentions by day
    const mentionsByDay = new Map<string, number>();

    analysisData.forEach((row: any) => {
        const day = new Date(row.analyzed_at).toISOString().split('T')[0];
        const mentions = row.mentions || [];
        const count = mentions.filter((m: any) =>
            // Count all mentions for now, ideally filter by brandId if we stored it
            // Assuming the collection was for the brand
            true
        ).length;

        mentionsByDay.set(day, (mentionsByDay.get(day) || 0) + count);
    });

    // 3. Align data series
    const alignedMentions: number[] = [];
    const alignedExternal: number[] = [];

    // Sort external data by date
    const sortedExternal = [...config.externalData].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedExternal.forEach(point => {
        const day = new Date(point.date).toISOString().split('T')[0];
        if (mentionsByDay.has(day)) {
            alignedMentions.push(mentionsByDay.get(day)!);
            alignedExternal.push(point.value);
        }
    });

    if (alignedMentions.length < 3) {
        throw new Error('Insufficient overlapping data points (minimum 3 required)');
    }

    // 4. Run statistical analysis
    const stats = analyzeCorrelation(alignedMentions, alignedExternal, config.metricName);

    return {
        brandId: config.brandId,
        metric: 'mentions', // currently validating mention count correlation
        pearsonCorrelation: stats.pearson,
        spearmanCorrelation: stats.spearman,
        sampleSize: stats.sampleSize,
        significance: stats.significance,
        startDate: config.startDate,
        endDate: config.endDate
    };
}

/**
 * Generate a readable report from the result
 */
export function generateCorrelationReport(result: CorrelationResult): string {
    const strength = Math.abs(result.pearsonCorrelation);
    let strengthDesc = 'no correlation';
    if (strength > 0.7) strengthDesc = 'strong';
    else if (strength > 0.4) strengthDesc = 'moderate';
    else if (strength > 0.2) strengthDesc = 'weak';

    const direction = result.pearsonCorrelation > 0 ? 'positive' : 'negative';
    const sigText = result.significance < 0.05 ? 'statistically significant' : 'not statistically significant';

    return `
Correlation Analysis Report
---------------------------
Period: ${result.startDate} to ${result.endDate}
Sample Size: ${result.sampleSize} days

Results:
- Pearson Correlation: ${result.pearsonCorrelation} (${strengthDesc} ${direction})
- Spearman Correlation: ${result.spearmanCorrelation}
- Significance (p): ${result.significance} (${sigText})

Interpretation:
We observed a ${strengthDesc} ${direction} correlation between LLM mentions and the external metric.
This relationship is ${sigText} (p=${result.significance}).
    `.trim();
}
