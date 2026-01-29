'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { getBrand, updateBrand } from '@/app/actions/brand';

export default function BrandSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [newKeyword, setNewKeyword] = useState('');

    useEffect(() => {
        async function loadBrand() {
            const result = await getBrand();
            if (result.success && result.brand) {
                setName(result.brand.name || '');
                setDomain(result.brand.domain || '');
                setKeywords(result.brand.keywords || []);
            }
            setLoading(false);
        }
        loadBrand();
    }, []);

    const handleAddKeyword = () => {
        if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
            setKeywords([...keywords, newKeyword.trim()]);
            setNewKeyword('');
        }
    };

    const handleRemoveKeyword = (keyword: string) => {
        setKeywords(keywords.filter(k => k !== keyword));
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await updateBrand({ name, domain, keywords });
        setSaving(false);

        if (result.success) {
            // Redirect to new collection page after saving
            router.push('/collections/new');
        } else {
            alert(result.error || 'Failed to save brand settings');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Brand Settings</h1>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Brand Settings</h1>
                <p className="text-muted-foreground">
                    Configure your brand details and tracking keywords
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Brand Information</CardTitle>
                    <CardDescription>
                        Update your brand name and domain
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Brand Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Clover Labs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                            id="domain"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="e.g., cloverlabs.io"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tracking Keywords</CardTitle>
                    <CardDescription>
                        Add search queries to track in LLM responses
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                            placeholder="e.g., best AI coding assistant"
                        />
                        <Button onClick={handleAddKeyword} variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </div>

                    {keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {keywords.map((keyword) => (
                                <Badge key={keyword} variant="secondary" className="text-sm">
                                    {keyword}
                                    <button
                                        onClick={() => handleRemoveKeyword(keyword)}
                                        className="ml-2 hover:text-destructive"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No keywords added yet. Add keywords to start tracking your brand in LLM responses.
                        </p>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}
