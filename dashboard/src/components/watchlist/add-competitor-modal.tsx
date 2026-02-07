'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { X, Plus, Loader2 } from 'lucide-react';

interface AddCompetitorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: { competitor_name: string; competitor_domain?: string; category?: string }) => Promise<void>;
    categories: string[];
    isAdding: boolean;
}

export function AddCompetitorModal({
    isOpen,
    onClose,
    onAdd,
    categories,
    isAdding,
}: AddCompetitorModalProps) {
    const [name, setName] = React.useState('');
    const [domain, setDomain] = React.useState('');
    const [category, setCategory] = React.useState(categories[0] || '');
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Competitor name is required');
            return;
        }

        try {
            await onAdd({
                competitor_name: name.trim(),
                competitor_domain: domain.trim() || undefined,
                category: category || undefined,
            });

            // Reset form on success
            setName('');
            setDomain('');
            setCategory(categories[0] || '');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add competitor');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-gray-900 border-gray-800 max-w-md w-full">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="border-b border-gray-700">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-xl">Add Competitor</CardTitle>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-6">
                        {error && (
                            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Competitor Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Competitor Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Ahrefs, Semrush"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                autoFocus
                            />
                        </div>

                        {/* Domain (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Domain <span className="text-gray-500">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder="e.g., ahrefs.com"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Category
                            </label>
                            {categories.length > 0 ? (
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    style={{ backgroundColor: '#1f2937' }}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat} style={{ backgroundColor: '#1f2937' }}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g., SEO tools, CRM software"
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="border-t border-gray-700 pt-4">
                        <div className="flex justify-end gap-3 w-full">
                            <Button type="button" variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isAdding || !name.trim()}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {isAdding ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                Add & Check
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
