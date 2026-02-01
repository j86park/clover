'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { startCollection, getAvailablePrompts } from '@/app/actions/collections';
import { getBrand } from '@/app/actions/brand';
import { AVAILABLE_MODELS } from '@/lib/openrouter/models';

export default function NewCollectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [brandName, setBrandName] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [competitorCount, setCompetitorCount] = useState(0);
    const [availablePrompts, setAvailablePrompts] = useState<any[]>([]);
    const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4o-mini', 'gemini-2-flash']);
    const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);

    useEffect(() => {
        async function loadData() {
            const [brandResult, promptResult] = await Promise.all([
                getBrand(),
                getAvailablePrompts()
            ]);

            if (brandResult.success && brandResult.brand) {
                setBrandName(brandResult.brand.name || 'Your Brand');
                setKeywords(brandResult.brand.keywords || []);
                setCompetitorCount(brandResult.brand.competitors?.length || 0);
            }

            if (promptResult.success && promptResult.prompts) {
                setAvailablePrompts(promptResult.prompts);
                // Select all prompts by default
                setSelectedPrompts(promptResult.prompts.map((p: any) => p.id));
            }

            setLoading(false);
        }
        loadData();
    }, []);

    const handleModelToggle = (modelKey: string) => {
        setSelectedModels(prev =>
            prev.includes(modelKey)
                ? prev.filter(k => k !== modelKey)
                : [...prev, modelKey]
        );
    };

    const handlePromptToggle = (promptId: string) => {
        setSelectedPrompts(prev =>
            prev.includes(promptId)
                ? prev.filter(id => id !== promptId)
                : [...prev, promptId]
        );
    };

    const handleStart = async () => {
        if (selectedModels.length === 0) {
            setError('Please select at least one model');
            return;
        }

        if (selectedPrompts.length === 0) {
            setError('Please select at least one prompt');
            return;
        }

        if (keywords.length === 0) {
            setError('Please add tracking keywords in Brand Settings first');
            return;
        }

        setStarting(true);
        setError(null);

        const result = await startCollection({
            models: selectedModels,
            promptIds: selectedPrompts,
        });

        setStarting(false);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/collections');
            }, 2000);
        } else {
            setError(result.error || 'Failed to start collection');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="space-y-6">
                <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        Collection started successfully! Redirecting to collections page...
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const hasComparisonPromptsSelected = availablePrompts.some(
        p => selectedPrompts.includes(p.id) && p.template.includes('{competitor}')
    );

    const willGenerateQueries = availablePrompts.some(p => {
        if (!selectedPrompts.includes(p.id)) return false;
        const needsCompetitor = p.template.includes('{competitor}');
        return !needsCompetitor || (needsCompetitor && competitorCount > 0);
    });

    const isStartDisabled = starting || selectedModels.length === 0 || selectedPrompts.length === 0 || !willGenerateQueries || keywords.length === 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">New Collection</h1>
                    <p className="text-muted-foreground">
                        Select models and prompts to evaluate your brand
                    </p>
                </div>
                <Button
                    onClick={handleStart}
                    disabled={isStartDisabled}
                >
                    {starting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting...
                        </>
                    ) : (
                        'Start Collection'
                    )}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {hasComparisonPromptsSelected && competitorCount === 0 && (
                <Alert className="border-amber-500 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                        Some of your selected prompts require competitors to compare against.
                        Please add competitors in{' '}
                        <a href="/settings/brand" className="font-bold underline">
                            Brand Settings
                        </a>{' '}
                        to enable comparison queries.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Models</CardTitle>
                        <CardDescription>
                            Choose which LLM models to query
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(AVAILABLE_MODELS).map(([key, model]) => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`model-${key}`}
                                    checked={selectedModels.includes(key)}
                                    onCheckedChange={() => handleModelToggle(key)}
                                />
                                <Label
                                    htmlFor={`model-${key}`}
                                    className="text-sm font-normal cursor-pointer flex-1"
                                >
                                    <span className="font-medium">{model.name}</span>
                                    <span className="text-muted-foreground ml-2">
                                        ({model.provider})
                                    </span>
                                </Label>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Select Prompts</CardTitle>
                        <CardDescription>
                            Choose the templates to run
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {availablePrompts.length > 0 ? (
                            availablePrompts.map((prompt) => (
                                <div key={prompt.id} className="flex items-start space-x-2 pb-2 border-b last:border-0">
                                    <Checkbox
                                        id={`prompt-${prompt.id}`}
                                        checked={selectedPrompts.includes(prompt.id)}
                                        onCheckedChange={() => handlePromptToggle(prompt.id)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <Label
                                            htmlFor={`prompt-${prompt.id}`}
                                            className="text-sm font-medium leading-none cursor-pointer capitalize"
                                        >
                                            {prompt.category}: {prompt.intent}
                                        </Label>
                                        <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                            "{prompt.template}"
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No prompts found in database.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tracking Keywords</CardTitle>
                    <CardDescription>
                        Used to populate variable templates like {'{brand}'} and {'{category}'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {keywords.map((keyword) => (
                                <span
                                    key={keyword}
                                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            No keywords configured. Please add keywords in{' '}
                            <a href="/settings/brand" className="text-primary hover:underline">
                                Brand Settings
                            </a>
                            .
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex gap-3">
                <Button
                    onClick={handleStart}
                    disabled={starting || keywords.length === 0 || selectedPrompts.length === 0}
                    className="flex-1"
                >
                    {starting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting Collection...
                        </>
                    ) : (
                        'Start Collection'
                    )}
                </Button>
                <Button
                    variant="outline"
                    onClick={() => router.push('/collections')}
                    disabled={starting}
                >
                    Cancel
                </Button>
            </div>

            <Alert>
                <AlertDescription className="text-sm">
                    <strong>Note:</strong> Collection runs in the background and may take several
                    minutes depending on the number of models and prompts. You'll be able to view
                    progress on the Collections page.
                </AlertDescription>
            </Alert>
        </div>
    );
}
