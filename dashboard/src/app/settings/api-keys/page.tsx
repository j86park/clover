'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Key, Trash2, Copy, Check, AlertTriangle } from 'lucide-react';
import { generateApiKey, listApiKeys, revokeApiKey, ApiKey } from '@/app/actions/api-keys';

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [creating, setCreating] = useState(false);

    const fetchKeys = useCallback(async () => {
        const result = await listApiKeys();
        if (result.success && result.keys) {
            setKeys(result.keys);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) return;

        setCreating(true);
        const result = await generateApiKey(newKeyName.trim());
        setCreating(false);

        if (result.success && result.rawKey) {
            setGeneratedKey(result.rawKey);
            fetchKeys(); // Refresh list
        } else {
            alert(result.error || 'Failed to create key');
        }
    };

    const handleRevokeKey = async (keyId: string) => {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
            return;
        }

        const result = await revokeApiKey(keyId);
        if (result.success) {
            fetchKeys(); // Refresh list
        } else {
            alert(result.error || 'Failed to revoke key');
        }
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setNewKeyName('');
        setGeneratedKey(null);
        setCopied(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
                    <p className="text-muted-foreground">
                        Manage your API keys for external integrations
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create API Key
                </Button>
            </div>

            {/* Create Key Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>
                                {generatedKey ? 'API Key Created!' : 'Create New API Key'}
                            </CardTitle>
                            {!generatedKey && (
                                <CardDescription>
                                    Give your key a name to help you identify it later
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!generatedKey ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="keyName">Key Name</Label>
                                        <Input
                                            id="keyName"
                                            placeholder="e.g., Production Monitor"
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={closeModal}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCreateKey}
                                            disabled={!newKeyName.trim() || creating}
                                        >
                                            {creating ? 'Creating...' : 'Create Key'}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-destructive">Copy your API key now!</p>
                                                <p className="text-muted-foreground mt-1">
                                                    This key will only be shown once. Store it securely.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Your API Key</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                readOnly
                                                value={generatedKey}
                                                className="font-mono text-sm"
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => copyToClipboard(generatedKey)}
                                            >
                                                {copied ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <Button className="w-full" onClick={closeModal}>
                                        Done
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Active Keys</CardTitle>
                    <CardDescription>
                        Your API keys are used to authenticate requests to the v1 API
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Loading...
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="text-center py-12">
                            <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No API keys</h3>
                            <p className="text-muted-foreground">
                                Create your first API key to get started
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Key</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Last Used</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {keys.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">{key.name}</TableCell>
                                        <TableCell className="font-mono text-sm">{key.key_prefix}</TableCell>
                                        <TableCell>
                                            {key.permissions.map((perm) => (
                                                <Badge key={perm} variant="secondary" className="mr-1">
                                                    {perm}
                                                </Badge>
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(key.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {key.last_used_at
                                                ? new Date(key.last_used_at).toLocaleDateString()
                                                : 'Never'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleRevokeKey(key.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>API Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Use your API key in requests by including it in the X-API-Key header:
                    </p>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        {`curl -H "X-API-Key: clv_live_your_key_here" \\
     https://your-domain.com/api/v1/metrics`}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
