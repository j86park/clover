import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';

interface AnalysisListProps {
    analyses: (AnalysisResult & {
        responses: {
            model: string;
            prompt_text: string;
            response_text: string;
        } | null;
    })[];
}

export function AnalysisList({ analyses }: AnalysisListProps) {
    if (!analyses || analyses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No analyses yet</h3>
                <p className="text-muted-foreground max-w-xs">
                    Analysis results will appear here once your collections are processed.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {analyses.map((item) => (
                <Card key={item.id} className="overflow-hidden border-primary/10">
                    <CardHeader className="bg-muted/30 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <Badge variant="secondary" className="w-fit">
                                    {item.responses?.model || 'Unknown Model'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    Analyzed on {new Date(item.analyzed_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex gap-4 text-xs font-medium">
                                <div className="flex items-center gap-1.5">
                                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                    <span>{item.mentions.length} Mentions</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <LinkIcon className="h-3.5 w-3.5 text-blue-500" />
                                    <span>{item.citations.length} Citations</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {/* Summary Section */}
                        {item.summary && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold uppercase tracking-tight text-muted-foreground">Executive Summary</h4>
                                <p className="text-sm leading-relaxed">{item.summary}</p>
                            </div>
                        )}

                        {/* Mentions Section */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold uppercase tracking-tight text-muted-foreground">Top Mentions</h4>
                                <div className="space-y-2">
                                    {item.mentions.slice(0, 3).map((m, i) => (
                                        <div key={i} className="p-3 rounded-md bg-muted/50 border text-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-primary">{m.brand_name}</span>
                                                <Badge variant={m.sentiment === 'positive' ? 'default' : m.sentiment === 'negative' ? 'destructive' : 'secondary'} className="h-4 text-[10px]">
                                                    {m.sentiment}
                                                </Badge>
                                            </div>
                                            <p className="text-xs italic text-muted-foreground line-clamp-2">"{m.context}"</p>
                                        </div>
                                    ))}
                                    {item.mentions.length === 0 && <p className="text-xs text-muted-foreground italic">No brand mentions detected.</p>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold uppercase tracking-tight text-muted-foreground">Sample Citations</h4>
                                <div className="space-y-2">
                                    {item.citations.slice(0, 3).map((c, i) => (
                                        <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors group">
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-xs font-bold truncate">{c.domain}</span>
                                                <span className="text-[10px] text-muted-foreground truncate">{c.url}</span>
                                            </div>
                                            <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                        </a>
                                    ))}
                                    {item.citations.length === 0 && <p className="text-xs text-muted-foreground italic">No citations found in response.</p>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
