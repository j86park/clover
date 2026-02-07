'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DEFAULT_PROMPTS,
    getAllCategories,
    getCategoryDisplayName,
    type PromptCategory,
    type PromptTemplate,
} from '@/lib/prompts';
import { Search, Plus, Check, Sparkles, Scale, Star, ShoppingCart, TrendingUp, ArrowLeft } from 'lucide-react';

interface TemplateLibraryProps {
    onSelectTemplate?: (template: PromptTemplate) => void;
    selectedIntents?: string[];
    showAddButton?: boolean;
}

const categoryIcons: Record<PromptCategory, React.ReactNode> = {
    discovery: <Sparkles className="h-4 w-4" />,
    comparison: <Scale className="h-4 w-4" />,
    review: <Star className="h-4 w-4" />,
    purchasing: <ShoppingCart className="h-4 w-4" />,
    trending: <TrendingUp className="h-4 w-4" />,
};

const categoryColors: Record<PromptCategory, string> = {
    discovery: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    comparison: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purchasing: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    trending: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const COLLECTION_PROMPTS_KEY = 'clover_collection_prompts';

interface DatabasePrompt {
    id: string;
    category: string;
    intent: string;
    template: string;
    user_id?: string | null;
}

export function TemplateLibrary({
    onSelectTemplate,
    selectedIntents = [],
    showAddButton = true,
}: TemplateLibraryProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isAddToCollectionMode = searchParams.get('addToCollection') === 'true';

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<PromptCategory | 'all'>('all');
    const [addedIds, setAddedIds] = useState<string[]>([]);
    const [databasePrompts, setDatabasePrompts] = useState<DatabasePrompt[]>([]);
    const [loadingDbPrompts, setLoadingDbPrompts] = useState(false);

    // Fetch database prompts when in addToCollection mode
    useEffect(() => {
        if (isAddToCollectionMode) {
            setLoadingDbPrompts(true);
            fetch('/api/prompts')
                .then(res => res.json())
                .then(response => {
                    if (response.data) {
                        setDatabasePrompts(response.data);
                    }
                })
                .catch(err => console.error('Failed to fetch prompts:', err))
                .finally(() => setLoadingDbPrompts(false));

            // Load existing added prompt IDs from localStorage
            const existing = localStorage.getItem(COLLECTION_PROMPTS_KEY);
            if (existing) {
                setAddedIds(JSON.parse(existing));
            }
        }
    }, [isAddToCollectionMode]);

    const handleAddToCollection = (promptId: string) => {
        if (typeof window !== 'undefined') {
            const existing = localStorage.getItem(COLLECTION_PROMPTS_KEY);
            const currentIds: string[] = existing ? JSON.parse(existing) : [];

            if (!currentIds.includes(promptId)) {
                const updated = [...currentIds, promptId];
                localStorage.setItem(COLLECTION_PROMPTS_KEY, JSON.stringify(updated));
                setAddedIds(updated);
            }
        }
    };

    const categories = getAllCategories();

    // Use database prompts when in addToCollection mode, otherwise use DEFAULT_PROMPTS
    const basePrompts = useMemo((): Array<{ id?: string; category: PromptCategory; intent: string; template: string; description: string }> => {
        if (isAddToCollectionMode && databasePrompts.length > 0) {
            // Convert database prompts to match PromptTemplate format
            return databasePrompts.map(p => ({
                id: p.id,
                category: p.category as PromptCategory,
                intent: p.intent,
                template: p.template,
                description: p.intent, // Use intent as description for display
            }));
        }
        return DEFAULT_PROMPTS.map(p => ({ ...p, id: undefined }));
    }, [isAddToCollectionMode, databasePrompts]);

    const filteredPrompts = useMemo(() => {
        let prompts = basePrompts;

        // Filter by category
        if (activeCategory !== 'all') {
            prompts = prompts.filter(p => p.category === activeCategory);
        }

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            prompts = prompts.filter(
                p =>
                    p.intent.toLowerCase().includes(query) ||
                    p.template.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query)
            );
        }

        return prompts;
    }, [basePrompts, activeCategory, searchQuery]);

    type ExtendedPrompt = { id?: string; category: PromptCategory; intent: string; template: string; description: string };

    const promptsByCategory = useMemo(() => {
        const grouped: Record<string, ExtendedPrompt[]> = {};
        for (const prompt of filteredPrompts) {
            if (!grouped[prompt.category]) {
                grouped[prompt.category] = [];
            }
            grouped[prompt.category].push(prompt);
        }
        return grouped;
    }, [filteredPrompts]);

    const handleSelectTemplate = (template: PromptTemplate) => {
        if (onSelectTemplate) {
            onSelectTemplate(template);
        }
    };

    const isSelected = (intent: string) => selectedIntents.includes(intent);
    const isAddedToQueue = (promptId: string | undefined) => promptId ? addedIds.includes(promptId) : false;

    return (
        <div className="space-y-6">
            {/* Floating banner when in addToCollection mode */}
            {isAddToCollectionMode && (
                <div className="sticky top-0 z-20 -mx-6 px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ArrowLeft className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm">
                                {addedIds.length > 0
                                    ? <><strong className="text-emerald-400">{addedIds.length}</strong> prompt{addedIds.length !== 1 ? 's' : ''} added to collection</>
                                    : 'Click prompts below to add them to your collection'
                                }
                            </span>
                        </div>
                        <Button
                            onClick={() => router.push('/collections/new')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            size="sm"
                        >
                            {addedIds.length > 0 ? 'Done — Back to Collection' : 'Back to Collection'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={activeCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('all')}
                    className={activeCategory === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                    All ({DEFAULT_PROMPTS.length})
                </Button>
                {categories.map((category) => {
                    const count = DEFAULT_PROMPTS.filter(p => p.category === category).length;
                    return (
                        <Button
                            key={category}
                            variant={activeCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveCategory(category)}
                            className={activeCategory === category ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                        >
                            {categoryIcons[category]}
                            <span className="ml-1">{getCategoryDisplayName(category)} ({count})</span>
                        </Button>
                    );
                })}
            </div>

            {/* Template Grid */}
            <div className="space-y-8">
                {Object.entries(promptsByCategory).map(([category, prompts]) => (
                    <div key={category}>
                        <div className="flex items-center gap-2 mb-4">
                            {categoryIcons[category as PromptCategory]}
                            <h3 className="text-lg font-semibold">{getCategoryDisplayName(category as PromptCategory)}</h3>
                            <Badge variant="secondary" className="ml-2">{prompts.length} prompts</Badge>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {prompts.map((template) => (
                                <Card
                                    key={template.intent}
                                    className={`cursor-pointer transition-all ${isSelected(template.intent)
                                        ? 'ring-2 ring-emerald-500 bg-emerald-500/5'
                                        : 'hover:bg-white/[0.06]'
                                        }`}
                                    onClick={() => handleSelectTemplate(template)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-base font-medium">
                                                {template.description}
                                            </CardTitle>
                                            {isSelected(template.intent) && (
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <Badge className={categoryColors[template.category]} variant="outline">
                                            {template.category}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground font-mono bg-black/20 p-2 rounded">
                                            {template.template}
                                        </p>
                                        {(showAddButton || isAddToCollectionMode) && !isSelected(template.intent) && (
                                            isAddedToQueue(template.id) ? (
                                                <div className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-emerald-400">
                                                    <Check className="h-4 w-4" />
                                                    <span className="text-sm">Added to Collection</span>
                                                </div>
                                            ) : template.id ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="mt-3 w-full hover:bg-emerald-500/10 hover:text-emerald-400"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCollection(template.id!);
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add to Collection
                                                </Button>
                                            ) : null
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {filteredPrompts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No prompts found matching your search.</p>
                </div>
            )}
        </div>
    );
}
