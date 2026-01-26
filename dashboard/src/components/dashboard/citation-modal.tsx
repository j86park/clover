'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Citation } from '@/types/analysis';
import { ExternalLink, X } from 'lucide-react';

interface CitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    citations: Citation[];
    isLoading: boolean;
}

import { createPortal } from 'react-dom';

export function CitationModal({ isOpen, onClose, title, citations, isLoading }: CitationModalProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            style={{ width: '100vw', height: '100vh' }}
            onClick={onClose}
        >
            {/* Modal Card */}
            <Card
                className="w-full max-w-lg shadow-2xl relative bg-background border-primary/20 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 hover:bg-muted z-30"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <CardHeader>
                    <CardTitle className="text-xl">
                        {title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 max-h-[80vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="flex h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p className="text-sm text-muted-foreground">Finding relevant citations...</p>
                        </div>
                    ) : citations.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground mb-4">
                                Top {citations.length} sample citations spotted by LLMs:
                            </p>
                            {citations.map((citation, i) => (
                                <a
                                    key={i}
                                    href={citation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="flex flex-col gap-1 overflow-hidden">
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                            {citation.domain}
                                        </span>
                                        <span className="text-sm text-muted-foreground truncate max-w-[340px]">
                                            {citation.url}
                                        </span>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 text-center">
                            <p className="text-muted-foreground italic">No specific URLs found for this category.</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t mt-4">
                        <Button onClick={onClose} variant="secondary">Close</Button>
                    </div>
                </CardContent>
            </Card>
        </div>,
        document.body
    );
}
