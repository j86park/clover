'use client';

/**
 * Model Radar Chart Component
 * Displays a radar chart comparing metrics across different LLM models
 */

import * as React from 'react';
import {
    RadarChart as RechartsRadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { ModelMetrics } from '@/lib/metrics/model-breakdown';

// Color palette for different models
const MODEL_COLORS: Record<string, string> = {
    'OpenAI': '#10b981',      // Emerald
    'Anthropic': '#f97316',   // Orange
    'Google': '#3b82f6',      // Blue
    'Meta': '#8b5cf6',        // Purple
    'Perplexity': '#ec4899',  // Pink
    'default': '#6b7280',     // Gray
};

interface ModelRadarChartProps {
    models: ModelMetrics[];
    isLoading?: boolean;
}

export function ModelRadarChart({ models, isLoading }: ModelRadarChartProps) {
    if (isLoading) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Model Comparison</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                </CardContent>
            </Card>
        );
    }

    if (models.length === 0) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Model Comparison</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <p className="text-gray-500">No model data available yet. Run a collection first.</p>
                </CardContent>
            </Card>
        );
    }

    // Limit to top 4 models
    const topModels = models.slice(0, 4);

    // Transform data for radar chart
    // Each data point is a metric, and each "series" is a model
    const radarData = [
        {
            metric: 'ASoV',
            fullName: 'Answer Share of Voice',
            ...Object.fromEntries(topModels.map(m => [m.displayName, m.asov])),
        },
        {
            metric: 'AIGVR',
            fullName: 'AI Visibility Rate',
            ...Object.fromEntries(topModels.map(m => [m.displayName, m.aigvr])),
        },
        {
            metric: 'Sentiment',
            fullName: 'Sentiment Score',
            // Normalize sentiment from -1..1 to 0..100 for chart
            ...Object.fromEntries(topModels.map(m => [m.displayName, ((m.sentiment + 1) / 2) * 100])),
        },
    ];

    return (
        <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    Model Comparison
                    <span className="text-sm font-normal text-gray-500">
                        (How different LLMs perceive your brand)
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <RechartsRadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis
                            dataKey="metric"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fill: '#6b7280' }}
                            tickCount={5}
                        />
                        {topModels.map((model) => (
                            <Radar
                                key={model.model}
                                name={model.displayName}
                                dataKey={model.displayName}
                                stroke={MODEL_COLORS[model.provider] || MODEL_COLORS.default}
                                fill={MODEL_COLORS[model.provider] || MODEL_COLORS.default}
                                fillOpacity={0.15}
                                strokeWidth={2}
                            />
                        ))}
                        <Legend
                            wrapperStyle={{ paddingTop: 20 }}
                            formatter={(value) => <span style={{ color: '#d1d5db' }}>{value}</span>}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#f3f4f6' }}
                            itemStyle={{ color: '#d1d5db' }}
                        />
                    </RechartsRadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
