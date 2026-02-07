'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import type { PromptEffectivenessSummary, PromptEffectiveness } from '@/types';

function MentionRateBar({ rate }: { rate: number }) {
    const getColor = (rate: number) => {
        if (rate >= 70) return 'bg-green-500';
        if (rate >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full ${getColor(rate)} transition-all duration-300`}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                />
            </div>
            <span className={`text-sm font-mono ${rate >= 70 ? 'text-green-400' : rate >= 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                {rate}%
            </span>
        </div>
    );
}

function PromptRow({ prompt }: { prompt: PromptEffectiveness }) {
    const truncatedText = prompt.promptText.length > 80
        ? prompt.promptText.substring(0, 80) + '...'
        : prompt.promptText;

    return (
        <div className="py-3 border-b border-gray-800/50 last:border-0">
            <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-sm text-gray-300 flex-1">{truncatedText}</p>
                <Badge variant="outline" className="text-xs shrink-0">
                    {prompt.category}
                </Badge>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <MentionRateBar rate={prompt.mentionRate} />
                </div>
                <div className="text-xs text-gray-500 shrink-0">
                    {prompt.mentionCount}/{prompt.totalResponses} mentions
                </div>
            </div>
        </div>
    );
}

export function PromptEffectivenessCard() {
    const [data, setData] = React.useState<PromptEffectivenessSummary | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/analysis/prompts');
                if (!res.ok) throw new Error('Failed to fetch');
                const result = await res.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="py-8 text-center text-red-400">
                    {error}
                </CardContent>
            </Card>
        );
    }

    if (!data || data.prompts.length === 0) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-emerald-500" />
                        Prompt Effectiveness
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-8 text-center">
                    <BarChart3 className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No prompt data available yet.</p>
                    <p className="text-gray-500 text-sm mt-1">
                        Run a collection to see which prompts work best.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                    Prompt Effectiveness
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-800/50 rounded-lg">
                    {data.summary.bestPrompt && (
                        <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-gray-400">Best Performer</p>
                                <p className="text-sm text-white truncate max-w-[200px]">
                                    {data.summary.bestPrompt.text}
                                </p>
                                <p className="text-xs text-green-400 font-mono">
                                    {data.summary.bestPrompt.rate}% mention rate
                                </p>
                            </div>
                        </div>
                    )}
                    {data.summary.worstPrompt && (
                        <div className="flex items-start gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-gray-400">Needs Work</p>
                                <p className="text-sm text-white truncate max-w-[200px]">
                                    {data.summary.worstPrompt.text}
                                </p>
                                <p className="text-xs text-red-400 font-mono">
                                    {data.summary.worstPrompt.rate}% mention rate
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Prompt List */}
                <div className="divide-y divide-gray-800/50">
                    {data.prompts.slice(0, 10).map((prompt, index) => (
                        <PromptRow key={prompt.promptId || index} prompt={prompt} />
                    ))}
                </div>

                {data.prompts.length > 10 && (
                    <p className="text-xs text-gray-500 text-center">
                        Showing top 10 of {data.prompts.length} prompts
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
