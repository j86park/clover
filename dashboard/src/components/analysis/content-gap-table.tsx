'use client';

/**
 * Content Gap Table
 * Shows topics where competitors are mentioned more than the user's brand
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface CompetitorMentionCount {
    name: string;
    count: number;
}

interface ContentGap {
    topic: string;
    promptCategory: string;
    competitorMentions: CompetitorMentionCount[];
    userMentions: number;
    gapScore: number;
    examplePrompts: string[];
}

interface ContentGapResult {
    gaps: ContentGap[];
    brandName: string;
    totalGapsFound: number;
    generatedAt: string;
}

type SortField = 'gapScore' | 'userMentions' | 'topic';
type SortDirection = 'asc' | 'desc';

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function ContentGapTable() {
    const [data, setData] = React.useState<ContentGapResult | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [expandedTopic, setExpandedTopic] = React.useState<string | null>(null);
    const [sortField, setSortField] = React.useState<SortField>('gapScore');
    const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');

    React.useEffect(() => {
        async function fetchGaps() {
            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch('/api/analysis/gaps');

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to fetch content gaps');
                }

                const result = await res.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        }

        fetchGaps();
    }, []);

    // Sorting logic
    const sortedGaps = React.useMemo(() => {
        if (!data?.gaps) return [];

        return [...data.gaps].sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'gapScore':
                    comparison = a.gapScore - b.gapScore;
                    break;
                case 'userMentions':
                    comparison = a.userMentions - b.userMentions;
                    break;
                case 'topic':
                    comparison = a.topic.localeCompare(b.topic);
                    break;
            }

            return sortDirection === 'desc' ? -comparison : comparison;
        });
    }, [data?.gaps, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getSortIndicator = (field: SortField) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'desc' ? '↓' : '↑';
    };

    // Loading state
    if (isLoading) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        📊 Content Gaps
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3">
                        <div className="h-10 bg-gray-800 rounded" />
                        <div className="h-10 bg-gray-800 rounded" />
                        <div className="h-10 bg-gray-800 rounded" />
                    </div>
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
                        📊 Content Gaps
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

    // Empty state
    if (!sortedGaps.length) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        📊 Content Gaps
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <span className="text-4xl mb-4 block">🎯</span>
                        <h3 className="text-lg font-semibold text-white mb-2">No Gaps Detected</h3>
                        <p className="text-gray-400">
                            Great job! Competitors aren't appearing in areas where you're absent.
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
                    📊 Content Gaps
                    <Badge variant="outline" className="ml-2 text-orange-400 border-orange-500/30">
                        {data?.totalGapsFound} opportunities
                    </Badge>
                </CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                    Topics where competitors are mentioned but {data?.brandName} is not
                </p>
            </CardHeader>
            <CardContent>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-800/50 rounded-t-lg text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                        onClick={() => handleSort('topic')}
                        className="col-span-4 text-left hover:text-white transition-colors flex items-center gap-1"
                    >
                        Topic {getSortIndicator('topic')}
                    </button>
                    <div className="col-span-2 text-center">Category</div>
                    <button
                        onClick={() => handleSort('userMentions')}
                        className="col-span-2 text-center hover:text-white transition-colors"
                    >
                        You {getSortIndicator('userMentions')}
                    </button>
                    <div className="col-span-2 text-center">Competitors</div>
                    <button
                        onClick={() => handleSort('gapScore')}
                        className="col-span-2 text-center hover:text-white transition-colors"
                    >
                        Gap {getSortIndicator('gapScore')}
                    </button>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-800">
                    {sortedGaps.slice(0, 20).map((gap) => {
                        const isExpanded = expandedTopic === gap.topic;
                        const totalCompetitorMentions = gap.competitorMentions.reduce((sum, c) => sum + c.count, 0);

                        // Color coding based on gap severity
                        const gapColorClass = gap.gapScore >= 10
                            ? 'text-red-400'
                            : gap.gapScore >= 5
                                ? 'text-orange-400'
                                : 'text-yellow-400';

                        return (
                            <div key={gap.topic}>
                                <div
                                    className={clsx(
                                        'grid grid-cols-12 gap-4 px-4 py-3 cursor-pointer transition-colors',
                                        'hover:bg-gray-800/30',
                                        isExpanded && 'bg-gray-800/50'
                                    )}
                                    onClick={() => setExpandedTopic(isExpanded ? null : gap.topic)}
                                >
                                    {/* Topic */}
                                    <div className="col-span-4 text-white font-medium truncate" title={gap.topic}>
                                        {gap.topic}
                                    </div>

                                    {/* Category */}
                                    <div className="col-span-2 text-center">
                                        <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
                                            {gap.promptCategory}
                                        </Badge>
                                    </div>

                                    {/* User Mentions */}
                                    <div className="col-span-2 text-center">
                                        <span className={clsx(
                                            'font-mono',
                                            gap.userMentions === 0 ? 'text-red-400' : 'text-gray-300'
                                        )}>
                                            {gap.userMentions}
                                        </span>
                                    </div>

                                    {/* Competitor Mentions */}
                                    <div className="col-span-2 text-center">
                                        <span className="font-mono text-emerald-400">
                                            {totalCompetitorMentions}
                                        </span>
                                    </div>

                                    {/* Gap Score */}
                                    <div className="col-span-2 text-center">
                                        <span className={clsx('font-mono font-bold', gapColorClass)}>
                                            +{gap.gapScore}
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="px-4 py-4 bg-gray-800/30 border-t border-gray-700">
                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Competitor Breakdown */}
                                            <div>
                                                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                                                    Competitor Breakdown
                                                </h4>
                                                <div className="space-y-1">
                                                    {gap.competitorMentions.slice(0, 5).map((c) => (
                                                        <div key={c.name} className="flex justify-between text-sm">
                                                            <span className="text-gray-300">{c.name}</span>
                                                            <span className="font-mono text-emerald-400">{c.count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Example Prompts */}
                                            <div>
                                                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                                                    Example Prompts
                                                </h4>
                                                <div className="space-y-2">
                                                    {gap.examplePrompts.map((prompt, i) => (
                                                        <p key={i} className="text-sm text-gray-400 italic">
                                                            "{prompt}..."
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-4 pt-4 border-t border-gray-700">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // TODO: Link to prompt builder with topic pre-filled
                                                    window.location.href = '/prompts/builder';
                                                }}
                                            >
                                                Create Content for This Topic →
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Show more indicator */}
                {sortedGaps.length > 20 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                        Showing top 20 of {sortedGaps.length} gaps
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
