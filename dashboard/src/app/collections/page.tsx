import { CollectionList } from '@/components/collections/collection-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';

export default async function CollectionsPage() {
    const supabase = await createServerClient();

    // Fetch collections with their brand names
    const { data: collections, error } = await supabase
        .from('collections')
        .select(`
            *,
            brands (
                name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching collections:', error);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
                    <p className="text-muted-foreground">
                        View and manage your data collection runs
                    </p>
                </div>
                <Link href="/collections/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Collection
                    </Button>
                </Link>
            </div>

            <CollectionList collections={(collections || []) as any} />
        </div>
    );
}
