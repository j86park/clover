'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { UsageStats } from '@/app/actions/usage';

interface UsageClientProps {
    stats: UsageStats;
}

export function UsageClient({ stats }: UsageClientProps) {
    const successRate = stats.totalCalls > 0
        ? (stats.successfulCalls / stats.totalCalls * 100).toFixed(1)
        : "0.0";

    return (
        <div className="space-y-6">
            {/* Usage Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Total API Calls"
                    value={stats.totalCalls.toLocaleString()}
                    icon={Activity}
                />
                <MetricCard
                    label="Successful Calls"
                    value={stats.successfulCalls.toLocaleString()}
                    icon={CheckCircle}
                />
                <MetricCard
                    label="Failed Calls"
                    value={stats.failedCalls.toLocaleString()}
                    icon={XCircle}
                />
                <MetricCard
                    label="Avg Response Time"
                    value={`${stats.avgResponseTime}ms`}
                    icon={Clock}
                />
            </div>

            {/* Usage Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>API Calls Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        {stats.chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData}>
                                    <defs>
                                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="grid gap-1">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                API Calls
                                                            </span>
                                                            <span className="font-bold text-foreground">
                                                                {payload[0].value}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="calls"
                                        stroke="hsl(var(--primary))"
                                        fillOpacity={1}
                                        fill="url(#colorCalls)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No API usage recorded yet.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Success Rate */}
            <Card>
                <CardHeader>
                    <CardTitle>Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-green-500 h-full transition-all duration-500"
                                style={{ width: `${successRate}%` }}
                            />
                        </div>
                        <span className="font-semibold">
                            {successRate}%
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
