'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    RefreshCw,
    Trash2,
    TrendingUp,
    TrendingDown,
    Minus,
    Loader2,
    ExternalLink
} from 'lucide-react';
import type { WatchlistEntry } from '@/types';

interface WatchlistTableProps {
    entries: WatchlistEntry[];
    onCheck: (entryId: string) => Promise<void>;
    onDelete: (entryId: string) => Promise<void>;
    onRefreshAll: () => Promise<void>;
    checkingIds: Set<string>;
    isRefreshingAll: boolean;
}

function TrendIndicator({ direction }: { direction: WatchlistEntry['trend_direction'] }) {
    if (direction === 'up') {
        return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (direction === 'down') {
        return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
}

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function WatchlistTable({
    entries,
    onCheck,
    onDelete,
    onRefreshAll,
    checkingIds,
    isRefreshingAll,
}: WatchlistTableProps) {
    if (entries.length === 0) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="py-12 text-center">
                    <RefreshCw className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No competitors tracked</h3>
                    <p className="text-gray-500">
                        Add competitors to your watchlist to track their AI visibility independently.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Competitor Watchlist</CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefreshAll}
                    disabled={isRefreshingAll || checkingIds.size > 0}
                    className="border-gray-700"
                >
                    {isRefreshingAll ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh All
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Competitor</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium">ASoV</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium">AIGVR</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Sentiment</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Trend</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Checked</th>
                                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => {
                                const isChecking = checkingIds.has(entry.id);
                                return (
                                    <tr key={entry.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{entry.competitor_name}</span>
                                                {entry.competitor_domain && (
                                                    <a
                                                        href={`https://${entry.competitor_domain}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-gray-500 hover:text-emerald-500 flex items-center gap-1"
                                                    >
                                                        {entry.competitor_domain}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="text-white font-mono">
                                                {entry.latest_asov != null ? `${entry.latest_asov}%` : '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="text-white font-mono">
                                                {entry.latest_aigvr != null ? `${entry.latest_aigvr}%` : '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`font-mono ${entry.latest_sentiment != null
                                                    ? entry.latest_sentiment > 0
                                                        ? 'text-green-500'
                                                        : entry.latest_sentiment < 0
                                                            ? 'text-red-500'
                                                            : 'text-gray-400'
                                                    : 'text-gray-500'
                                                }`}>
                                                {entry.latest_sentiment != null ? entry.latest_sentiment.toFixed(2) : '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex justify-center">
                                                <TrendIndicator direction={entry.trend_direction} />
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 text-sm">
                                            {formatDate(entry.last_checked_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onCheck(entry.id)}
                                                    disabled={isChecking || isRefreshingAll}
                                                    className="text-emerald-500 hover:text-emerald-400"
                                                >
                                                    {isChecking ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDelete(entry.id)}
                                                    disabled={isChecking || isRefreshingAll}
                                                    className="text-red-500 hover:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
