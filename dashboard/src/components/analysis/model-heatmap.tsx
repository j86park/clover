'use client';

/**
 * Model Heatmap Component
 * Displays a heatmap grid showing how different metrics vary across LLM models
 */

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ModelMetrics } from '@/lib/metrics/model-breakdown';

interface ModelHeatmapProps {
    models: ModelMetrics[];
    isLoading?: boolean;
}

// Get color based on value (0-100 scale)
function getHeatColor(value: number, min: number, max: number): string {
    // Normalize to 0-1
    const range = max - min;
    const normalized = range === 0 ? 0.5 : (value - min) / range;

    // Color interpolation: red (low) -> yellow (mid) -> green (high)
    if (normalized < 0.5) {
        // Red to Yellow
        const intensity = normalized * 2;
        return `rgba(${255}, ${Math.round(200 * intensity)}, ${50}, 0.7)`;
    } else {
        // Yellow to Green
        const intensity = (normalized - 0.5) * 2;
        return `rgba(${Math.round(255 * (1 - intensity))}, ${200 + Math.round(55 * intensity)}, ${50 + Math.round(100 * intensity)}, 0.7)`;
    }
}

// Get sentiment color (-1 to 1 scale)
function getSentimentColor(value: number): string {
    if (value < -0.3) return 'rgba(239, 68, 68, 0.7)';   // Red
    if (value < 0) return 'rgba(251, 146, 60, 0.7)';    // Orange
    if (value < 0.3) return 'rgba(250, 204, 21, 0.7)';  // Yellow
    if (value < 0.6) return 'rgba(132, 204, 22, 0.7)';  // Lime
    return 'rgba(34, 197, 94, 0.7)';                     // Green
}

export function ModelHeatmap({ models, isLoading }: ModelHeatmapProps) {
    if (isLoading) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Model Heatmap</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                </CardContent>
            </Card>
        );
    }

    if (models.length === 0) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Model Heatmap</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <p className="text-gray-500">No model data available yet. Run a collection first.</p>
                </CardContent>
            </Card>
        );
    }

    // Limit to top 4 models
    const topModels = models.slice(0, 4);

    // Calculate min/max for each metric
    const asovValues = topModels.map(m => m.asov);
    const aigvrValues = topModels.map(m => m.aigvr);
    const asovMin = Math.min(...asovValues);
    const asovMax = Math.max(...asovValues);
    const aigvrMin = Math.min(...aigvrValues);
    const aigvrMax = Math.max(...aigvrValues);

    const metrics = [
        { key: 'asov', label: 'ASoV', unit: '%' },
        { key: 'aigvr', label: 'AIGVR', unit: '%' },
        { key: 'sentiment', label: 'Sentiment', unit: '' },
    ];

    return (
        <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    Model Heatmap
                    <span className="text-sm font-normal text-gray-500">
                        (Quick visual comparison)
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Model</th>
                                {metrics.map(metric => (
                                    <th key={metric.key} className="text-center py-3 px-4 text-gray-400 font-medium">
                                        {metric.label}
                                    </th>
                                ))}
                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Responses</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topModels.map((model, idx) => (
                                <tr
                                    key={model.model}
                                    className={cn(
                                        "border-b border-gray-800/50",
                                        idx === 0 && "bg-emerald-900/10" // Highlight best model
                                    )}
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{model.displayName}</span>
                                            <span className="text-xs text-gray-500">{model.provider}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div
                                            className="inline-flex items-center justify-center w-16 h-10 rounded-md font-mono text-sm font-medium"
                                            style={{ backgroundColor: getHeatColor(model.asov, asovMin, asovMax) }}
                                            title={`ASoV: ${model.asov.toFixed(1)}%`}
                                        >
                                            {model.asov.toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div
                                            className="inline-flex items-center justify-center w-16 h-10 rounded-md font-mono text-sm font-medium"
                                            style={{ backgroundColor: getHeatColor(model.aigvr, aigvrMin, aigvrMax) }}
                                            title={`AIGVR: ${model.aigvr.toFixed(1)}%`}
                                        >
                                            {model.aigvr.toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div
                                            className="inline-flex items-center justify-center w-16 h-10 rounded-md font-mono text-sm font-medium"
                                            style={{ backgroundColor: getSentimentColor(model.sentiment) }}
                                            title={`Sentiment: ${model.sentiment.toFixed(2)}`}
                                        >
                                            {model.sentiment >= 0 ? '+' : ''}{model.sentiment.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="text-gray-400 font-mono text-sm">
                                            {model.responseCount}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.7)' }} />
                        <span>Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(250, 204, 21, 0.7)' }} />
                        <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.7)' }} />
                        <span>High</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
