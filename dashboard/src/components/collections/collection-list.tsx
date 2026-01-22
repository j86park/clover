import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Collection } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface CollectionListProps {
    collections: (Collection & { brands?: { name: string } })[];
}

export function CollectionList({ collections }: CollectionListProps) {
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
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map((collection) => (
                                <tr key={collection.id} className="border-b hover:bg-muted/50">
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
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/collections/${collection.id}`}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            View
                                        </Link>
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
