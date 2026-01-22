'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ASoVTrendChartProps {
    data?: Array<{
        date: string;
        asov: number;
    }>;
}

// Mock data for now - in Phase 6, this will fetch from API
const mockData = [
    { date: '2026-01-15', asov: 38.5 },
    { date: '2026-01-16', asov: 41.2 },
    { date: '2026-01-17', asov: 39.8 },
    { date: '2026-01-18', asov: 43.1 },
    { date: '2026-01-19', asov: 42.7 },
    { date: '2026-01-20', asov: 44.9 },
    { date: '2026-01-21', asov: 45.2 },
];

export function ASoVTrendChart({ data = mockData }: ASoVTrendChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Share of Voice Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorAsov" x1="0" y1="0" x2="0" y2="1">
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
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        ASoV
                                                    </span>
                                                    <span className="font-bold text-foreground">
                                                        {payload[0].value}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="asov"
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#colorAsov)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
