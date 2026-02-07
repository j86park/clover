'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Sparkles, Scale, Star, ShoppingCart, TrendingUp, User, Plus } from 'lucide-react';

interface Prompt {
    id: string;
    category: string;
    intent: string;
    template: string;
    user_id?: string | null;
}

interface PromptSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availablePrompts: Prompt[];
    selectedPromptIds: string[];
    onSelectPrompts: (promptIds: string[]) => void;
    onRefresh?: () => Promise<void>;
}

const categoryIcons: Record<string, React.ReactNode> = {
    discovery: <Sparkles className="h-4 w-4" />,
    comparison: <Scale className="h-4 w-4" />,
    review: <Star className="h-4 w-4" />,
    purchasing: <ShoppingCart className="h-4 w-4" />,
    trending: <TrendingUp className="h-4 w-4" />,
};

export function PromptSelectorDialog({
    open,
    onOpenChange,
    availablePrompts,
    selectedPromptIds,
    onSelectPrompts,
    onRefresh,
}: PromptSelectorDialogProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [localSelectedIds, setLocalSelectedIds] = React.useState<string[]>([]);
    const [isCreating, setIsCreating] = React.useState(false);
    const [newPrompt, setNewPrompt] = React.useState({
        category: 'discovery',
        intent: '',
        template: ''
    });
    const [isSaving, setIsSaving] = React.useState(false);
    const [creationError, setCreationError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (open) {
            setLocalSelectedIds(selectedPromptIds);
        }
    }, [open, selectedPromptIds]);

    const filteredPrompts = React.useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return availablePrompts;

        return availablePrompts.filter((p) => {
            const intent = (p.intent || '').toLowerCase();
            const template = (p.template || '').toLowerCase();
            const category = (p.category || '').toLowerCase();

            return intent.includes(query) ||
                template.includes(query) ||
                category.includes(query);
        });
    }, [availablePrompts, searchQuery]);

    const handleToggle = (id: string) => {
        setLocalSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const selectedSet = React.useMemo(() => new Set(localSelectedIds), [localSelectedIds]);

    const groupedPrompts = React.useMemo(() => {
        const grouped: Record<string, Prompt[]> = {};
        for (const prompt of filteredPrompts) {
            const cat = prompt.category || 'other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(prompt);
        }
        return grouped;
    }, [filteredPrompts]);

    const handleConfirm = () => {
        onSelectPrompts(localSelectedIds);
        onOpenChange(false);
    };

    const handleCreateCustom = async () => {
        if (!newPrompt.intent || !newPrompt.template) {
            setCreationError('Intent and template are required');
            return;
        }

        setIsSaving(true);
        setCreationError(null);
        try {
            const response = await fetch('/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPrompt),
            });

            const result = await response.json();
            if (result.success && result.data) {
                // Refresh parent prompts first
                if (onRefresh) {
                    await onRefresh();
                }

                // Add the new prompt to local selection
                const newId = result.data.id;
                setLocalSelectedIds(prev => [...new Set([...prev, newId])]);

                // Reset form
                setNewPrompt({ category: 'discovery', intent: '', template: '' });
                setIsCreating(false);
            } else {
                setCreationError(result.error || 'Failed to create prompt');
            }
        } catch (error) {
            console.error('Error creating prompt:', error);
            setCreationError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const categories = React.useMemo(() => {
        return Object.keys(groupedPrompts).sort();
    }, [groupedPrompts]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-6 bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle>Add Prompts from Library</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Select more prompt templates to include in your collection run.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 my-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search prompts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-black border-gray-800 focus:ring-emerald-500"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsCreating(!isCreating)}
                        className={`border-gray-800 ${isCreating ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' : 'hover:bg-gray-800'}`}
                    >
                        {isCreating ? 'Cancel' : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Custom Prompt
                            </>
                        )}
                    </Button>
                </div>

                {isCreating && (
                    <div className="mb-6 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400 uppercase tracking-wider">Category</Label>
                                <select
                                    value={newPrompt.category}
                                    onChange={(e) => setNewPrompt({ ...newPrompt, category: e.target.value })}
                                    className="w-full bg-black border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                    <option value="discovery">Discovery</option>
                                    <option value="comparison">Comparison</option>
                                    <option value="review">Review</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400 uppercase tracking-wider">Prompt Name (Intent)</Label>
                                <Input
                                    placeholder="e.g. Unique Selling Points"
                                    value={newPrompt.intent}
                                    onChange={(e) => setNewPrompt({ ...newPrompt, intent: e.target.value })}
                                    className="bg-black border-gray-800 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-gray-400 uppercase tracking-wider">Prompt Template</Label>
                            <textarea
                                placeholder="What are the main benefits of using {brand} for {category}?"
                                value={newPrompt.template}
                                onChange={(e) => setNewPrompt({ ...newPrompt, template: e.target.value })}
                                className="w-full h-24 bg-black border border-gray-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <p className="text-[10px] text-gray-500">
                                Tip: Use <code className="text-emerald-500">{'{brand}'}</code> and <code className="text-emerald-500">{'{category}'}</code> as variables.
                            </p>
                        </div>
                        {creationError && (
                            <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                                {creationError}
                            </p>
                        )}
                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                disabled={!newPrompt.intent || !newPrompt.template || isSaving}
                                onClick={handleCreateCustom}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                {isSaving ? 'Creating...' : 'Save & Add Custom Prompt'}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {categories.map((category) => {
                        const promptsInCategory = groupedPrompts[category];

                        return (
                            <div key={category} className="space-y-3">
                                <div className="flex items-center gap-2 sticky top-0 bg-gray-900 py-1 z-10">
                                    {categoryIcons[category] || <Sparkles className="h-4 w-4" />}
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                                        {category}
                                    </h3>
                                    <Badge variant="outline" className="text-[10px] border-gray-700">
                                        {promptsInCategory.length}
                                    </Badge>
                                </div>
                                <div className="grid gap-2">
                                    {promptsInCategory.map((prompt) => (
                                        <div
                                            key={prompt.id}
                                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${selectedSet.has(prompt.id)
                                                ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                                : 'border-gray-800 hover:border-gray-700 hover:bg-white/[0.02]'
                                                }`}
                                            onClick={() => handleToggle(prompt.id)}
                                        >
                                            <Checkbox
                                                id={`dialog-prompt-${prompt.id}`}
                                                checked={selectedSet.has(prompt.id)}
                                                onCheckedChange={() => handleToggle(prompt.id)}
                                                className="mt-1 border-gray-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                            />
                                            <div className="flex-1 space-y-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <Label
                                                        htmlFor={`dialog-prompt-${prompt.id}`}
                                                        className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                                                    >
                                                        {prompt.intent}
                                                        {prompt.user_id && (
                                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] h-4 px-1">
                                                                <User className="h-2 w-2 mr-1" />
                                                                Custom
                                                            </Badge>
                                                        )}
                                                    </Label>
                                                </div>
                                                <p className="text-xs text-gray-400 line-clamp-2 italic italic">
                                                    "{prompt.template}"
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {filteredPrompts.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>No prompts found matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6 pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between w-full">
                        <p className="text-xs text-gray-500">
                            {localSelectedIds.length} prompts selected
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-700 hover:bg-gray-800">
                                Cancel
                            </Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                onClick={handleConfirm}
                            >
                                Add Selected Prompts
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
