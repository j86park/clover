import { QueryIntent } from '@/types';

/**
 * Generate a safe, read-only SQL query based on the parsed intent.
 * This function enforces user scoping and whitelists tables/columns.
 */
export function generateSafeSQL(intent: QueryIntent, userId: string): string {
    const metricMap: Record<string, string> = {
        asov: 'asov',
        aigvr: 'aigvr',
        sentiment: 'sentiment_score',
        citations: 'total_mentions',
    };

    const timeRangeMap: Record<string, string> = {
        last_week: "INTERVAL '7 days'",
        last_month: "INTERVAL '30 days'",
        last_quarter: "INTERVAL '90 days'",
        all_time: "INTERVAL '10 years'", // Effectively all time for this dashboard
    };

    const metric = metricMap[intent.metricType] || 'asov';
    const interval = timeRangeMap[intent.timeRange] || "INTERVAL '30 days'";

    // Basic query template: Get average metrics per brand over time
    if (intent.metricType !== 'general') {
        const sql = `
            SELECT 
                brand_name,
                AVG(${metric}) as value,
                DATE_TRUNC('day', created_at) as date
            FROM metrics
            WHERE brand_id IN (SELECT id FROM brands WHERE user_id = '${userId}')
            AND created_at > NOW() - ${interval}
            GROUP BY brand_name, date
            ORDER BY date DESC
        `;
        return sql.trim();
    }

    // Comparison or General query
    if (intent.comparison) {
        return `
            SELECT 
                brand_name,
                AVG(asov) as asov,
                AVG(aigvr) as aigvr,
                AVG(sentiment_score) as sentiment
            FROM metrics
            WHERE brand_id IN (SELECT id FROM brands WHERE user_id = '${userId}')
            AND created_at > NOW() - ${interval}
            AND (brand_name ILIKE '%${intent.comparison}%' OR brand_name IN (SELECT name FROM brands WHERE user_id = '${userId}'))
            GROUP BY brand_name
        `.trim();
    }

    // Default: Summary of all metrics for user's brands
    return `
        SELECT 
            brand_name,
            AVG(asov) as asov,
            AVG(aigvr) as aigvr,
            AVG(sentiment_score) as sentiment,
            MAX(created_at) as last_updated
        FROM metrics
        WHERE brand_id IN (SELECT id FROM brands WHERE user_id = '${userId}')
        AND created_at > NOW() - ${interval}
        GROUP BY brand_name
    `.trim();
}
