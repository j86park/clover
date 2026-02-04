'use client';

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Collection } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Loader2, ExternalLink } from 'lucide-react';
import { deleteCollection } from '@/app/actions/collections';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface CollectionListProps {
    collections: (Collection & { brands?: { name: string } })[];
}

export function CollectionList({ collections: initialCollections }: CollectionListProps) {
    const router = useRouter();
    const supabase = createClient();
    const [collections, setCollections] = useState(initialCollections);
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Sync state with props when server-side data changes
    useEffect(() => {
        setCollections(initialCollections);
    }, [initialCollections]);

    // Subscribe to realtime updates
    useEffect(() => {
        const channel = supabase
            .channel('collections-status-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'collections',
                },
                (payload) => {
                    const updatedCollection = payload.new as Collection;

                    // Update local state for immediate feedback
                    setCollections(prev =>
                        prev.map(c => c.id === updatedCollection.id
                            ? { ...c, status: updatedCollection.status, completed_at: updatedCollection.completed_at }
                            : c
                        )
                    );

                    // Refresh server data to ensure consistency (e.g., related data)
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, router]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this collection and all its results?')) {
            return;
        }

        setDeletingId(id);
        startTransition(async () => {
            const result = await deleteCollection(id);
            if (result.success) {
                setCollections(prev => prev.filter(c => c.id !== id));
            } else {
                alert(result.error || 'Failed to delete collection');
            }
            setDeletingId(null);
        });
    };

    if (collections.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">No collections found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Start a new collection to gather data
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Collections</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Brand</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map((collection) => (
                                <tr key={collection.id} className="border-b hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">
                                        {formatDistanceToNow(new Date(collection.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4">
                                        {collection.brands?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={
                                                collection.status === 'completed'
                                                    ? 'success'
                                                    : collection.status === 'failed'
                                                        ? 'destructive'
                                                        : collection.status === 'running'
                                                            ? 'warning'
                                                            : 'secondary'
                                            }
                                        >
                                            {collection.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/collections/${collection.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 gap-1">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(collection.id)}
                                                disabled={deletingId === collection.id}
                                            >
                                                {deletingId === collection.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
