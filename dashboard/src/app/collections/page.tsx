import { CollectionList } from '@/components/collections/collection-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase';
import { DEFAULT_PROMPTS } from '@/lib/prompts';

export default async function CollectionsPage() {
    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user's custom prompts count (or use defaults)
    let activePromptCount = DEFAULT_PROMPTS.length;
    if (user) {
        const { data: prompts, count } = await supabase
            .from('prompts')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('is_active', true);

        if (count && count > 0) {
            activePromptCount = count;
        }
    }

    // Fetch collections for brands owned by the user
    const { data: collections, error } = await supabase
        .from('collections')
        .select(`
            *,
            brands!inner (
                name,
                user_id
            )
        `)
        .eq('brands.user_id', user?.id)
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

            {/* Prompt Info Card */}
            <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-emerald-500" />
                        <div>
                            <p className="font-medium">
                                Using <Badge variant="secondary" className="mx-1 bg-emerald-500/20 text-emerald-400">{activePromptCount}</Badge> prompts from library
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Each collection queries LLMs with these prompt templates
                            </p>
                        </div>
                    </div>
                    <Link href="/settings/prompts">
                        <Button variant="outline" size="sm" className="border-emerald-500/30 hover:bg-emerald-500/10">
                            <Settings className="h-4 w-4 mr-1" />
                            Customize Prompts
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <CollectionList collections={(collections || []) as any} />
        </div>
    );
}

