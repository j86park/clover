'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { getBrand, updateBrand, addCompetitor, deleteCompetitor } from '@/app/actions/brand';

export default function BrandSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [newKeyword, setNewKeyword] = useState('');
    const [competitors, setCompetitors] = useState<any[]>([]);
    const [newCompName, setNewCompName] = useState('');
    const [newCompDomain, setNewCompDomain] = useState('');
    const [addingComp, setAddingComp] = useState(false);

    useEffect(() => {
        async function loadData() {
            const result = await getBrand();
            if (result.success && result.brand) {
                setName(result.brand.name || '');
                setDomain(result.brand.domain || '');
                setKeywords(result.brand.keywords || []);
                setCompetitors(result.brand.competitors || []);
            }
            setLoading(false);
        }
        loadData();
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

    const handleAddCompetitor = async () => {
        if (!newCompName.trim()) return;
        setAddingComp(true);
        const result = await addCompetitor({
            name: newCompName.trim(),
            domain: newCompDomain.trim() || undefined
        });
        setAddingComp(false);

        if (result.success) {
            setNewCompName('');
            setNewCompDomain('');
            // Refresh brand data to get the new competitor with its ID
            const brandResult = await getBrand();
            if (brandResult.success && brandResult.brand) {
                setCompetitors(brandResult.brand.competitors || []);
            }
        } else {
            alert(result.error || 'Failed to add competitor');
        }
    };

    const handleRemoveCompetitor = async (id: string) => {
        const result = await deleteCompetitor(id);
        if (result.success) {
            setCompetitors(competitors.filter(c => c.id !== id));
        } else {
            alert(result.error || 'Failed to remove competitor');
        }
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
                    Configure your brand details, tracking keywords, and competitors
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
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
                                <Button onClick={handleAddKeyword} variant="outline" size="icon">
                                    <Plus className="h-4 w-4" />
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
                                    No keywords added yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Competitors</CardTitle>
                        <CardDescription>
                            Compare your brand against these competitors
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="comp-name">Name</Label>
                            <Input
                                id="comp-name"
                                value={newCompName}
                                onChange={(e) => setNewCompName(e.target.value)}
                                placeholder="e.g., Clay"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="comp-domain">Domain (Optional)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="comp-domain"
                                    value={newCompDomain}
                                    onChange={(e) => setNewCompDomain(e.target.value)}
                                    placeholder="e.g., clay.com"
                                />
                                <Button onClick={handleAddCompetitor} disabled={addingComp || !newCompName.trim()}>
                                    {addingComp ? '...' : <Plus className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {competitors.length > 0 ? (
                                competitors.map((comp) => (
                                    <div key={comp.id} className="flex items-center justify-between p-2 rounded-md border text-sm">
                                        <div>
                                            <span className="font-medium">{comp.name}</span>
                                            {comp.domain && (
                                                <span className="text-muted-foreground ml-2">
                                                    ({comp.domain})
                                                </span>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleRemoveCompetitor(comp.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    No competitors added yet. Add competitors to enable comparison prompts.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => router.push('/collections')}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </div>
    );
}
