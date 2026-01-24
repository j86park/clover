'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AuthorityHeatmapProps {
    data?: {
        owned: number;
        earned: number;
        external: number;
    };
}

// Mock data for now
const defaultData = {
    owned: 145,
    earned: 187,
    external: 55,
};

export function AuthorityHeatmap({ data = defaultData }: AuthorityHeatmapProps) {
    const chartData = [
        { category: 'Owned Citations', value: data.owned, fill: 'hsl(var(--chart-1))' },
        { category: 'Earned Citations', value: data.earned, fill: 'hsl(var(--chart-2))' },
        { category: 'External Citations', value: data.external, fill: 'hsl(var(--chart-3))' },
    ];

    const total = data.owned + data.earned + data.external;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Authority Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="category"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
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
                                    const percentage = ((payload[0].value as number / total) * 100).toFixed(1);
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        {payload[0].payload.category}
                                                    </span>
                                                    <span className="font-bold text-foreground">
                                                        {payload[0].value} ({percentage}%)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="mt-4 flex justify-center gap-4 text-sm">
                    {chartData.map((item) => (
                        <div key={item.category} className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-sm"
                                style={{ backgroundColor: item.fill }}
                            />
                            <span className="text-muted-foreground">{item.category}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
