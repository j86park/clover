import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Key, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Mock data for now - will be replaced with API calls
const mockApiKeys = [
    {
        id: '1',
        name: 'Production API Key',
        key_prefix: 'clv_abc1...',
        is_active: true,
        created_at: '2026-01-15T10:00:00Z',
        last_used_at: '2026-01-22T09:30:00Z',
        permissions: ['read', 'write'],
    },
    {
        id: '2',
        name: 'Development Key',
        key_prefix: 'clv_dev2...',
        is_active: true,
        created_at: '2026-01-18T14:00:00Z',
        last_used_at: null,
        permissions: ['read'],
    },
];

export default function ApiKeysPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
                    <p className="text-muted-foreground">
                        Manage your API keys for external integrations
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create API Key
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Keys</CardTitle>
                    <CardDescription>
                        Your API keys are used to authenticate requests to the v1 API
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {mockApiKeys.length === 0 ? (
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
                                    <TableHead>Last Used</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockApiKeys.map((key) => (
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
                                            {key.last_used_at
                                                ? new Date(key.last_used_at).toLocaleDateString()
                                                : 'Never'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={key.is_active ? 'success' : 'destructive'}>
                                                {key.is_active ? 'Active' : 'Revoked'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/settings/usage?key=${key.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    View Usage
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="sm" className="text-destructive">
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
                        Use your API key in requests by including it in the header:
                    </p>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        Authorization: Bearer clv_your_api_key_here
                    </pre>
                    <p className="text-sm text-muted-foreground mt-4">
                        Or use the X-API-Key header:
                    </p>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        X-API-Key: clv_your_api_key_here
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
