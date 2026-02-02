'use server';

import { createServerClient } from '@/lib/supabase';

export interface UsageStats {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    avgResponseTime: number;
    chartData: { date: string; calls: number }[];
}

/**
 * Get aggregated API usage statistics for the current user.
 */
export async function getApiUsageStats(): Promise<UsageStats> {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Fetch all usage for the user
    const { data: usage, error } = await supabase
        .from('api_usage')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    if (error || !usage) {
        return {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            avgResponseTime: 0,
            chartData: [],
        };
    }

    const totalCalls = usage.length;
    const successfulCalls = usage.filter(u => u.status >= 200 && u.status < 300).length;
    const failedCalls = totalCalls - successfulCalls;
    const avgResponseTime = totalCalls > 0
        ? Math.round(usage.reduce((sum, u) => sum + u.response_time_ms, 0) / totalCalls)
        : 0;

    // Group by date for chart
    const groups = usage.reduce((acc: any, curr) => {
        const date = new Date(curr.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(groups).map(([date, calls]) => ({
        date,
        calls: calls as number,
    }));

    return {
        totalCalls,
        successfulCalls,
        failedCalls,
        avgResponseTime,
        chartData,
    };
}
