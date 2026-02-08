'use client';

/**
 * Citation Graph
 * Interactive force-directed graph visualization of citation sources
 * Uses CSS animations and SVG since react-force-graph isn't installed
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type SourceType = 'owned' | 'earned' | 'external';

interface NetworkNode {
    id: string;
    type: 'source' | 'brand';
    label: string;
    sourceType?: SourceType;
    mentionCount: number;
    domain?: string;
}

interface NetworkEdge {
    source: string;
    target: string;
    weight: number;
    responseIds: string[];
}

interface NetworkStats {
    totalSources: number;
    owned: number;
    earned: number;
    external: number;
    topSources: Array<{ domain: string; count: number; type: SourceType }>;
}

interface CitationNetwork {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
    stats: NetworkStats;
    brandName: string;
    generatedAt: string;
}

type FilterType = 'all' | SourceType;

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const SOURCE_COLORS: Record<SourceType, string> = {
    owned: '#10b981',   // emerald
    earned: '#3b82f6',  // blue
    external: '#6b7280', // gray
};

const SOURCE_LABELS: Record<SourceType, string> = {
    owned: 'Owned',
    earned: 'Earned',
    external: 'External',
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function CitationGraph() {
    const [data, setData] = React.useState<CitationNetwork | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [filter, setFilter] = React.useState<FilterType>('all');
    const [selectedNode, setSelectedNode] = React.useState<NetworkNode | null>(null);

    React.useEffect(() => {
        async function fetchNetwork() {
            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch('/api/citations/network');

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to fetch citation network');
                }

                const result = await res.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        }

        fetchNetwork();
    }, []);

    // Filter nodes based on selected filter
    const filteredNodes = React.useMemo(() => {
        if (!data) return [];

        return data.nodes.filter((node) => {
            if (node.type === 'brand') return true;
            if (filter === 'all') return true;
            return node.sourceType === filter;
        });
    }, [data, filter]);

    const filteredEdges = React.useMemo(() => {
        if (!data) return [];
        const nodeIds = new Set(filteredNodes.map((n) => n.id));
        return data.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    }, [data, filteredNodes]);

    // Get edge for selected node
    const selectedEdge = React.useMemo(() => {
        if (!selectedNode || !data) return null;
        return data.edges.find((e) => e.source === selectedNode.id);
    }, [selectedNode, data]);

    // Loading state
    if (isLoading) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">🔗 Citation Network</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
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
                    <CardTitle className="text-white">🔗 Citation Network</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
                        {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Empty state (no data at all)
    if (!data || data.nodes.length <= 1) {
        return (
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">🔗 Citation Network</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <span className="text-4xl mb-4 block">📡</span>
                        <h3 className="text-lg font-semibold text-white mb-2">No Citations Yet</h3>
                        <p className="text-gray-400">
                            Run a collection to start tracking citation sources.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate positions for circular layout
    const sourceNodes = filteredNodes.filter((n) => n.type === 'source');
    const brandNode = filteredNodes.find((n) => n.type === 'brand');
    const centerX = 300;
    const centerY = 200;
    const radius = 150;

    return (
        <div className="space-y-4">
            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="bg-gray-900/50 border-gray-800 p-4">
                    <div className="text-2xl font-bold text-white">{data.stats.totalSources}</div>
                    <div className="text-sm text-gray-400">Total Sources</div>
                </Card>
                <Card className="bg-gray-900/50 border-gray-800 p-4">
                    <div className="text-2xl font-bold text-emerald-400">{data.stats.owned}</div>
                    <div className="text-sm text-gray-400">Owned</div>
                </Card>
                <Card className="bg-gray-900/50 border-gray-800 p-4">
                    <div className="text-2xl font-bold text-blue-400">{data.stats.earned}</div>
                    <div className="text-sm text-gray-400">Earned</div>
                </Card>
                <Card className="bg-gray-900/50 border-gray-800 p-4">
                    <div className="text-2xl font-bold text-gray-400">{data.stats.external}</div>
                    <div className="text-sm text-gray-400">External</div>
                </Card>
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">🔗 Citation Network</CardTitle>
                    <div className="flex gap-2">
                        {(['all', 'owned', 'earned', 'external'] as const).map((f) => (
                            <Button
                                key={f}
                                variant={filter === f ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter(f)}
                                className={clsx(
                                    filter === f && f !== 'all' && {
                                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30': f === 'owned',
                                        'bg-blue-500/20 text-blue-400 border-blue-500/30': f === 'earned',
                                        'bg-gray-500/20 text-gray-400 border-gray-500/30': f === 'external',
                                    }
                                )}
                            >
                                {f === 'all' ? 'All' : SOURCE_LABELS[f]}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-6">
                        {/* Graph SVG */}
                        <div className="flex-1 bg-gray-950 rounded-lg p-4 min-h-[400px] flex flex-col relative">
                            {sourceNodes.length === 0 ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                    <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                                        <span className="text-2xl">🔍</span>
                                    </div>
                                    <h4 className="text-white font-medium mb-1">No {filter} citations found</h4>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        We couldn't find any {filter === 'all' ? '' : filter} sources for this brand in the current data set.
                                    </p>
                                    <Button
                                        variant="link"
                                        className="mt-2 text-emerald-400"
                                        onClick={() => setFilter('all')}
                                    >
                                        Show all sources
                                    </Button>
                                </div>
                            ) : (
                                <svg viewBox="0 0 600 400" className="w-full h-full">
                                    {/* Edges */}
                                    {sourceNodes.map((node, i) => {
                                        const angle = (i / sourceNodes.length) * 2 * Math.PI - Math.PI / 2;
                                        const x = centerX + radius * Math.cos(angle);
                                        const y = centerY + radius * Math.sin(angle);
                                        const edge = filteredEdges.find((e) => e.source === node.id);
                                        const strokeWidth = Math.min(4, 1 + (edge?.weight || 0) / 5);

                                        return (
                                            <line
                                                key={`edge-${node.id}`}
                                                x1={x}
                                                y1={y}
                                                x2={centerX}
                                                y2={centerY}
                                                stroke={node.sourceType ? SOURCE_COLORS[node.sourceType] : '#6b7280'}
                                                strokeWidth={strokeWidth}
                                                strokeOpacity={0.3}
                                            />
                                        );
                                    })}

                                    {/* Source Nodes */}
                                    {sourceNodes.map((node, i) => {
                                        const angle = (i / sourceNodes.length) * 2 * Math.PI - Math.PI / 2;
                                        const x = centerX + radius * Math.cos(angle);
                                        const y = centerY + radius * Math.sin(angle);
                                        const nodeRadius = Math.min(20, 8 + node.mentionCount / 2);
                                        const isSelected = selectedNode?.id === node.id;

                                        return (
                                            <g
                                                key={node.id}
                                                className="cursor-pointer"
                                                onClick={() => setSelectedNode(isSelected ? null : node)}
                                            >
                                                <circle
                                                    cx={x}
                                                    cy={y}
                                                    r={nodeRadius}
                                                    fill={node.sourceType ? SOURCE_COLORS[node.sourceType] : '#6b7280'}
                                                    stroke={isSelected ? '#fff' : 'transparent'}
                                                    strokeWidth={2}
                                                    className="transition-all hover:opacity-80"
                                                />
                                                <title>{node.label}: {node.mentionCount} citations</title>
                                            </g>
                                        );
                                    })}

                                    {/* Brand Node (Center) */}
                                    {brandNode && (
                                        <g>
                                            <circle
                                                cx={centerX}
                                                cy={centerY}
                                                r={30}
                                                fill="#14b8a6"
                                                stroke="#5eead4"
                                                strokeWidth={3}
                                            />
                                            <text
                                                x={centerX}
                                                y={centerY + 5}
                                                textAnchor="middle"
                                                fill="white"
                                                fontSize="10"
                                                fontWeight="bold"
                                            >
                                                {brandNode.label.slice(0, 8)}
                                            </text>
                                        </g>
                                    )}
                                </svg>
                            )}
                        </div>

                        {/* Side Panel */}
                        <div className="w-72 space-y-4">
                            {selectedNode ? (
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: selectedNode.sourceType ? SOURCE_COLORS[selectedNode.sourceType] : '#6b7280' }}
                                        />
                                        <h4 className="font-medium text-white">{selectedNode.label}</h4>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Type</span>
                                            <Badge variant="outline" className={clsx(
                                                'text-xs',
                                                selectedNode.sourceType === 'owned' && 'text-emerald-400 border-emerald-500/30',
                                                selectedNode.sourceType === 'earned' && 'text-blue-400 border-blue-500/30',
                                                selectedNode.sourceType === 'external' && 'text-gray-400 border-gray-500/30'
                                            )}>
                                                {selectedNode.sourceType ? SOURCE_LABELS[selectedNode.sourceType] : 'Unknown'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Citations</span>
                                            <span className="text-white font-mono">{selectedNode.mentionCount}</span>
                                        </div>
                                        {selectedEdge && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Responses</span>
                                                <span className="text-white font-mono">{selectedEdge.responseIds.length}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-4 text-emerald-400 border-emerald-500/30"
                                        onClick={() => window.open(`https://${selectedNode.domain}`, '_blank')}
                                    >
                                        Visit Source →
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-gray-800/50 rounded-lg p-4 text-center text-gray-400">
                                    <p className="text-sm">Click a node to see details</p>
                                </div>
                            )}

                            {/* Top Sources */}
                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <h4 className="font-medium text-white mb-3">Top Sources</h4>
                                <div className="space-y-2">
                                    {data.stats.topSources.slice(0, 5).map((source) => (
                                        <div key={source.domain} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: SOURCE_COLORS[source.type] }}
                                                />
                                                <span className="text-gray-300 truncate max-w-32">{source.domain}</span>
                                            </div>
                                            <span className="text-white font-mono">{source.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
