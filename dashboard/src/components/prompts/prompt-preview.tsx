'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';

interface PromptPreviewProps {
    prompt: string;
    variables?: Record<string, string | undefined>;
}

export function PromptPreview({ prompt, variables = {} }: PromptPreviewProps) {
    const [copied, setCopied] = React.useState(false);

    // Highlight variables in the prompt
    const highlightedPrompt = React.useMemo(() => {
        if (!prompt) return null;

        const variablePattern = /\{(\w+)\}/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = variablePattern.exec(prompt)) !== null) {
            // Add text before the variable
            if (match.index > lastIndex) {
                parts.push(prompt.slice(lastIndex, match.index));
            }

            const varName = match[1];
            const varValue = variables[varName];

            // Add the highlighted variable
            parts.push(
                <span
                    key={match.index}
                    className={varValue
                        ? 'px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-sm'
                        : 'px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-sm border border-dashed border-amber-500/50'
                    }
                >
                    {varValue || match[0]}
                </span>
            );

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < prompt.length) {
            parts.push(prompt.slice(lastIndex));
        }

        return parts;
    }, [prompt, variables]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const detectedVariables = React.useMemo(() => {
        const pattern = /\{(\w+)\}/g;
        const vars: string[] = [];
        let match;
        while ((match = pattern.exec(prompt)) !== null) {
            if (!vars.includes(match[1])) {
                vars.push(match[1]);
            }
        }
        return vars;
    }, [prompt]);

    if (!prompt) {
        return (
            <Card className="border-dashed border-muted-foreground/30">
                <CardContent className="py-8 text-center text-muted-foreground">
                    <p>Complete the wizard steps to preview your prompt</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Prompt Preview</CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                        </>
                    )}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Prompt Text */}
                <div className="p-4 rounded-md bg-muted/50 border font-mono text-sm leading-relaxed">
                    {highlightedPrompt}
                </div>

                {/* Variable Legend */}
                {detectedVariables.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground">Variables:</span>
                        {detectedVariables.map((v) => (
                            <Badge
                                key={v}
                                variant="outline"
                                className={variables[v]
                                    ? 'border-emerald-500/50 text-emerald-500'
                                    : 'border-amber-500/50 text-amber-500'
                                }
                            >
                                {`{${v}}`}
                                {variables[v] && <Check className="h-3 w-3 ml-1" />}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
