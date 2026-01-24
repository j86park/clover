/**
 * API Usage Tracking
 * Records and retrieves API usage statistics
 */

import { createClient } from '@/lib/supabase/server';

export interface UsageRecord {
    apiKeyId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTimeMs?: number;
}

export interface UsageStats {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    avgResponseTime: number;
    callsPerDay: { date: string; count: number }[];
}

/**
 * Track an API request
 */
export async function trackUsage(record: UsageRecord): Promise<void> {
    try {
        const supabase = await createClient();

        await supabase.from('api_usage').insert({
            api_key_id: record.apiKeyId,
            endpoint: record.endpoint,
            method: record.method,
            status_code: record.statusCode,
            response_time_ms: record.responseTimeMs,
        });
    } catch (error) {
        // Log but don't fail the request on tracking errors
        console.error('Failed to track API usage:', error);
    }
}

/**
 * Get usage statistics for an API key
 */
export async function getUsageStats(
    keyId: string,
    startDate?: Date,
    endDate?: Date
): Promise<UsageStats> {
    const supabase = await createClient();

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const end = endDate || new Date();

    const { data, error } = await supabase
        .from('api_usage')
        .select('*')
        .eq('api_key_id', keyId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false });

    if (error || !data) {
        console.error('Failed to fetch usage stats:', error);
        return {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            avgResponseTime: 0,
            callsPerDay: [],
        };
    }

    // Calculate statistics
    const totalCalls = data.length;
    const successfulCalls = data.filter(r => (r.status_code as number) >= 200 && (r.status_code as number) < 300).length;
    const failedCalls = data.filter(r => (r.status_code as number) >= 400).length;

    const responseTimes = data
        .filter(r => r.response_time_ms !== null && r.response_time_ms !== undefined)
        .map(r => r.response_time_ms as number);
    const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

    // Group by day
    const callsByDay = data.reduce((acc, record) => {
        const date = new Date(record.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const callsPerDay = Object.entries(callsByDay)
        .map(([date, count]) => ({ date, count: count as number }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        totalCalls,
        successfulCalls,
        failedCalls,
        avgResponseTime,
        callsPerDay,
    };
}

/**
 * Get usage summary for an API key (simplified stats)
 */
export async function getUsageSummary(keyId: string): Promise<{
    totalCalls: number;
    avgResponseTime: number;
    lastUsed: string | null;
}> {
    const supabase = await createClient();

    const { count } = await supabase
        .from('api_usage')
        .select('*', { count: 'exact', head: true })
        .eq('api_key_id', keyId);

    const { data: lastRecord } = await supabase
        .from('api_usage')
        .select('created_at, response_time_ms')
        .eq('api_key_id', keyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    return {
        totalCalls: count || 0,
        avgResponseTime: lastRecord?.response_time_ms || 0,
        lastUsed: lastRecord?.created_at || null,
    };
}
