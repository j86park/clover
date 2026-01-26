'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AuthorityHeatmapProps {
    data?: {
        owned: number;
        earned: number;
        external: number;
    };
    onCategoryClick?: (type: 'owned' | 'earned' | 'external') => void;
}

// Mock data for now
const defaultData = {
    owned: 0,
    earned: 0,
    external: 0,
};

export function AuthorityHeatmap({ data = defaultData, onCategoryClick }: AuthorityHeatmapProps) {
    const chartData = [
        { category: 'Owned Citations', type: 'owned', value: data.owned, fill: 'hsl(var(--chart-1))' },
        { category: 'Earned Citations', type: 'earned', value: data.earned, fill: 'hsl(var(--chart-2))' },
        { category: 'External Citations', type: 'external', value: data.external, fill: 'hsl(var(--chart-3))' },
    ];

    const total = data.owned + data.earned + data.external;

    const handleClick = (state: any) => {
        if (state && state.activePayload && onCategoryClick) {
            const type = state.activePayload[0].payload.type;
            onCategoryClick(type);
        }
    };

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
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            wrapperStyle={{ pointerEvents: 'none', outline: 'none' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const percentage = total === 0 ? '0' : ((payload[0].value as number / total) * 100).toFixed(1);
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm pointer-events-none">
                                            <div className="grid gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground font-bold">
                                                        {payload[0].payload.category}
                                                    </span>
                                                    <span className="font-bold text-foreground">
                                                        {payload[0].value} ({percentage}%)
                                                    </span>
                                                    <span className="text-[0.6rem] text-muted-foreground mt-1">
                                                        Click bar for samples →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="value"
                            radius={[4, 4, 0, 0]}
                            className="transition-opacity hover:opacity-80"
                            onClick={(data, index, event) => {
                                console.log('Bar clicked directly (detailed):', { data, index });
                                if (data && data.type) {
                                    onCategoryClick?.(data.type as 'owned' | 'earned' | 'external');
                                }
                            }}
                            cursor="pointer"
                        />
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
