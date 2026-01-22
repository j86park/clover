'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Mock data for demonstration
const mockUsageData = [
    { date: '2026-01-15', calls: 45 },
    { date: '2026-01-16', calls: 78 },
    { date: '2026-01-17', calls: 92 },
    { date: '2026-01-18', calls: 55 },
    { date: '2026-01-19', calls: 120 },
    { date: '2026-01-20', calls: 88 },
    { date: '2026-01-21', calls: 110 },
    { date: '2026-01-22', calls: 65 },
];

const mockStats = {
    totalCalls: 653,
    successfulCalls: 621,
    failedCalls: 32,
    avgResponseTime: 245,
};

export default function UsagePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">API Usage</h1>
                <p className="text-muted-foreground">
                    Monitor your API usage and performance metrics
                </p>
            </div>

            {/* Usage Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Total API Calls"
                    value={mockStats.totalCalls.toLocaleString()}
                    icon={Activity}
                />
                <MetricCard
                    label="Successful Calls"
                    value={mockStats.successfulCalls.toLocaleString()}
                    icon={CheckCircle}
                />
                <MetricCard
                    label="Failed Calls"
                    value={mockStats.failedCalls.toLocaleString()}
                    icon={XCircle}
                />
                <MetricCard
                    label="Avg Response Time"
                    value={`${mockStats.avgResponseTime}ms`}
                    icon={Clock}
                />
            </div>

            {/* Usage Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>API Calls Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={mockUsageData}>
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
                                className="bg-green-500 h-full"
                                style={{ width: `${(mockStats.successfulCalls / mockStats.totalCalls * 100).toFixed(1)}%` }}
                            />
                        </div>
                        <span className="font-semibold">
                            {(mockStats.successfulCalls / mockStats.totalCalls * 100).toFixed(1)}%
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
