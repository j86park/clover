import { createServerClient } from '@/lib/supabase';
import { TemplateLibrary } from '@/components/prompts/template-library';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEFAULT_PROMPTS } from '@/lib/prompts';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default async function PromptsSettingsPage() {
    const supabase = await createServerClient();

    // Get user's active prompts from database
    const { data: { user } } = await supabase.auth.getUser();

    let activePrompts: { id: string; intent: string; is_active: boolean }[] = [];

    if (user) {
        const { data: prompts } = await supabase
            .from('prompts')
            .select('id, intent, is_active')
            .eq('user_id', user.id);

        if (prompts) {
            activePrompts = prompts;
        }
    }

    const activeCount = activePrompts.filter(p => p.is_active).length;
    const totalLibrary = DEFAULT_PROMPTS.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/settings"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Settings
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Prompt Library</h1>
                    <p className="text-muted-foreground">
                        Browse and manage prompt templates for your data collections
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-2xl font-bold">{totalLibrary}</p>
                        <p className="text-sm text-muted-foreground">Templates Available</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Library Size
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{totalLibrary}</span>
                            <span className="text-sm text-muted-foreground">prompts</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active in Collections
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{activeCount || 'All'}</span>
                            <span className="text-sm text-muted-foreground">
                                {activeCount ? 'selected' : 'defaults'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">5</span>
                            <span className="text-sm text-muted-foreground">types</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info Banner */}
            <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="flex items-center gap-4 py-4">
                    <FileText className="h-8 w-8 text-emerald-500" />
                    <div className="flex-1">
                        <p className="font-medium">How Prompt Templates Work</p>
                        <p className="text-sm text-muted-foreground">
                            Prompts use variables like <code className="bg-black/30 px-1 rounded">{'{brand}'}</code>, <code className="bg-black/30 px-1 rounded">{'{category}'}</code>, and <code className="bg-black/30 px-1 rounded">{'{competitor}'}</code> that get filled in during data collection. More prompts = more comprehensive analysis, but also more API usage.
                        </p>
                    </div>
                    <Link href="/collections">
                        <Button variant="outline" className="border-emerald-500/30 hover:bg-emerald-500/10">
                            Run Collection
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Template Library */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Available Templates</CardTitle>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                            {totalLibrary} templates
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <TemplateLibrary showAddButton={false} />
                </CardContent>
            </Card>
        </div>
    );
}
