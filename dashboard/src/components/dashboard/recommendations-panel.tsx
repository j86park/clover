'use client';

/**
 * Recommendations Panel
 * Displays actionable recommendations to improve brand visibility
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type RecommendationPriority = 'high' | 'medium' | 'low';
type RecommendationType = 'content' | 'competitive' | 'reputation' | 'visibility' | 'success';

interface Recommendation {
    id: string;
    type: RecommendationType;
    priority: RecommendationPriority;
    title: string;
    description: string;
    action: string;
    reason: string;
    metrics: {
        current: number;
        target: number;
        unit: string;
    };
}

interface RecommendationsResult {
    recommendations: Recommendation[];
    brandName: string;
    generatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const PRIORITY_CONFIG: Record<RecommendationPriority, { label: string; color: string; icon: string }> = {
    high: {
        label: 'High Priority',
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: '🔴',
    },
    medium: {
        label: 'Medium Priority',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: '🟡',
    },
    low: {
        label: 'Low Priority',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: '🟢',
    },
};

const TYPE_ICONS: Record<RecommendationType, string> = {
    content: '📝',
    competitive: '⚔️',
    reputation: '🛡️',
    visibility: '👁️',
    success: '🏆',
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function RecommendationsPanel() {
    const [data, setData] = React.useState<RecommendationsResult | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [expandedId, setExpandedId] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchRecommendations() {
            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch('/api/recommendations');

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to fetch recommendations');
                }

                const result = await res.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        }

        fetchRecommendations();
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        💡 Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-20 bg-gray-800 rounded-lg" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        💡 Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
                        {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const recommendations = data?.recommendations || [];

    // Empty state - no issues
    if (recommendations.length === 0) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        💡 Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <span className="text-4xl mb-4 block">🎉</span>
                        <h3 className="text-lg font-semibold text-white mb-2">Great Work!</h3>
                        <p className="text-gray-400">
                            No issues detected. Your brand visibility looks healthy.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    💡 Recommendations
                    <Badge variant="outline" className="ml-2 text-emerald-400 border-emerald-500/30">
                        {recommendations.length} suggestions
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {recommendations.map((rec) => {
                    const priorityConfig = PRIORITY_CONFIG[rec.priority];
                    const isExpanded = expandedId === rec.id;
                    const typeIcon = TYPE_ICONS[rec.type];

                    return (
                        <div
                            key={rec.id}
                            className={clsx(
                                'border rounded-lg p-4 transition-all',
                                'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{typeIcon}</span>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white">{rec.title}</h4>
                                        <p className="text-sm text-gray-400 mt-1">{rec.description}</p>
                                    </div>
                                </div>
                                <Badge className={clsx('text-xs shrink-0', priorityConfig.color)}>
                                    {priorityConfig.icon} {priorityConfig.label}
                                </Badge>
                            </div>

                            {/* Progress indicator */}
                            <div className="mt-3 mb-2">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                    <span>Current: {rec.metrics.current.toFixed(1)} {rec.metrics.unit}</span>
                                    <span>Target: {rec.metrics.target.toFixed(1)} {rec.metrics.unit}</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(100, (rec.metrics.current / rec.metrics.target) * 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Expandable details */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                                className="text-gray-400 hover:text-white p-0 h-auto mt-2"
                            >
                                {isExpanded ? '▲ Hide Details' : '▼ Learn More'}
                            </Button>

                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-gray-700 space-y-3">
                                    <div>
                                        <h5 className="text-xs font-medium text-gray-500 uppercase mb-1">Recommended Action</h5>
                                        <p className="text-sm text-emerald-400">{rec.action}</p>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-medium text-gray-500 uppercase mb-1">Why This Matters</h5>
                                        <p className="text-sm text-gray-300">{rec.reason}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
