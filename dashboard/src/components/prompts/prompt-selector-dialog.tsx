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
import { Search, Sparkles, Scale, Star, ShoppingCart, TrendingUp, User } from 'lucide-react';

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
}: PromptSelectorDialogProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [localSelectedIds, setLocalSelectedIds] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (open) {
            setLocalSelectedIds(selectedPromptIds);
        }
    }, [open, selectedPromptIds]);

    const filteredPrompts = React.useMemo(() => {
        return availablePrompts.filter((p) => {
            const matchesSearch =
                p.intent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.template.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [availablePrompts, searchQuery]);

    const handleToggle = (id: string) => {
        setLocalSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        onSelectPrompts(localSelectedIds);
        onOpenChange(false);
    };

    const categories = Array.from(new Set(availablePrompts.map((p) => p.category)));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-6 bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle>Add Prompts from Library</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Select more prompt templates to include in your collection run.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-black border-gray-800 focus:ring-emerald-500"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {categories.map((category) => {
                        const promptsInCategory = filteredPrompts.filter((p) => p.category === category);
                        if (promptsInCategory.length === 0) return null;

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
                                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${localSelectedIds.includes(prompt.id)
                                                    ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                                    : 'border-gray-800 hover:border-gray-700 hover:bg-white/[0.02]'
                                                }`}
                                            onClick={() => handleToggle(prompt.id)}
                                        >
                                            <Checkbox
                                                id={`dialog-prompt-${prompt.id}`}
                                                checked={localSelectedIds.includes(prompt.id)}
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
