'use client';

/**
 * Model Breakdown Section
 * Client component that fetches model breakdown data and renders both radar and heatmap
 */

import * as React from 'react';
import { ModelRadarChart } from './model-radar-chart';
import { ModelHeatmap } from './model-heatmap';
import type { ModelMetrics } from '@/lib/metrics/model-breakdown';

interface ModelBreakdownSectionProps {
    collectionId?: string;
}

interface ModelBreakdownResponse {
    models: ModelMetrics[];
    summary: {
        bestModel: string | null;
        worstModel: string | null;
        totalModels: number;
    };
}

export function ModelBreakdownSection({ collectionId }: ModelBreakdownSectionProps) {
    const [data, setData] = React.useState<ModelBreakdownResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);

            try {
                const url = collectionId
                    ? `/api/metrics/by-model?collectionId=${collectionId}`
                    : '/api/metrics/by-model';

                const res = await fetch(url);

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to fetch model breakdown');
                }

                const result = await res.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [collectionId]);

    const models = data?.models || [];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                Model-by-Model Breakdown
                {data?.summary.bestModel && (
                    <span className="text-sm font-normal text-emerald-500">
                        Best: {data.summary.bestModel}
                    </span>
                )}
            </h2>

            {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                <ModelRadarChart models={models} isLoading={isLoading} />
                <ModelHeatmap models={models} isLoading={isLoading} />
            </div>
        </div>
    );
}
