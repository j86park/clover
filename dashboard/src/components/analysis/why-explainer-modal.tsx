'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Loader2, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';
import type { MentionExplanation } from '@/lib/analysis/explainer';

interface WhyExplainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    responseId: string;
    brandName: string;
}

export function WhyExplainerModal({ isOpen, onClose, responseId, brandName }: WhyExplainerModalProps) {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [explanation, setExplanation] = React.useState<MentionExplanation | null>(null);

    React.useEffect(() => {
        if (!isOpen) return;

        setLoading(true);
        setError(null);

        async function fetchExplanation() {
            try {
                const res = await fetch('/api/analysis/explain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ responseId, brandName }),
                });

                if (!res.ok) throw new Error('Failed to fetch explanation');

                const data = await res.json();
                setExplanation(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to load explanation');
            } finally {
                setLoading(false);
            }
        }

        fetchExplanation();
    }, [isOpen, responseId, brandName]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-lg bg-gray-900 border-gray-800 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-emerald-500" />
                        Why &ldquo;{brandName}&rdquo;?
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-3" />
                            <p className="text-gray-400 text-sm">Analyzing recommendation...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-6">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {!loading && !error && explanation && (
                        <>
                            {/* Reasoning */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-2">Why this recommendation:</h4>
                                <p className="text-white text-sm leading-relaxed">{explanation.reasoning}</p>
                            </div>

                            {/* Key Factors */}
                            {explanation.keyFactors.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-400 mb-2">Key factors:</h4>
                                    <ul className="space-y-1">
                                        {explanation.keyFactors.map((factor, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>{factor}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Suggestions */}
                            {explanation.suggestions.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-400 mb-2">How to improve visibility:</h4>
                                    <ul className="space-y-1">
                                        {explanation.suggestions.map((suggestion, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                <ArrowRight className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                                <span>{suggestion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Confidence */}
                            <div className="pt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${explanation.confidence === 'high'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : explanation.confidence === 'medium'
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                    {explanation.confidence.charAt(0).toUpperCase() + explanation.confidence.slice(1)} confidence
                                </span>
                            </div>
                        </>
                    )}
                </CardContent>

                <CardFooter className="pt-0">
                    <Button variant="outline" onClick={onClose} className="w-full">
                        Close
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

/**
 * Hook to manage explainer modal state
 */
export function useWhyExplainer() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [context, setContext] = React.useState<{ responseId: string; brandName: string } | null>(null);

    const openExplainer = React.useCallback((responseId: string, brandName: string) => {
        setContext({ responseId, brandName });
        setIsOpen(true);
    }, []);

    const closeExplainer = React.useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
        isOpen,
        context,
        openExplainer,
        closeExplainer,
    };
}
