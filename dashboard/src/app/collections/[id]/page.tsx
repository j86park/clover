import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompetitorTable } from '@/components/dashboard/competitor-table';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Heart, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollectionMetrics } from '@/lib/metrics/pipeline';
import { createServerClient } from '@/lib/supabase';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createServerClient();

    // Fetch the collection to make sure it exists
    const { data: collection } = await supabase
        .from('collections')
        .select(`
            *,
            brands (name)
        `)
        .eq('id', id)
        .single();

    if (!collection) {
        return notFound();
    }

    // Fetch real metrics for this collection
    const metricsResult = await getCollectionMetrics(id);

    if (!metricsResult) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/collections">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Collection Details</h1>
                        <p className="text-muted-foreground">
                            {collection.brands?.name} • Collection {id.slice(0, 8)}
                        </p>
                    </div>
                </div>
                <Card>
                    <CardContent className="py-20 text-center">
                        <p className="text-muted-foreground">No metrics have been generated for this collection yet.</p>
                        <p className="text-sm text-muted-foreground mt-2">Metrics are usually generated within 30 seconds of collection completion.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { brand_metrics, competitor_metrics } = metricsResult;
    const totalAuthority = brand_metrics.authority_score;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/collections">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Collection Details</h1>
                    <p className="text-muted-foreground">
                        {brand_metrics.brand_name} • Collection {id.slice(0, 8)}
                    </p>
                </div>
            </div>

            {/* Metrics Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Average Share of Voice"
                    value={`${brand_metrics.asov.toFixed(1)}%`}
                    icon={BarChart3}
                />
                <MetricCard
                    label="AI-Generated Visibility Rate"
                    value={`${brand_metrics.aigvr.toFixed(1)}%`}
                    icon={TrendingUp}
                />
                <MetricCard
                    label="Authority Score"
                    value={totalAuthority.toFixed(2)}
                    icon={Award}
                />
                <MetricCard
                    label="Sentiment Score"
                    value={`${((brand_metrics.sentiment_score + 1) / 2 * 100).toFixed(0)}%`}
                    icon={Heart}
                />
            </div>

            {/* Competitor Comparison */}
            <CompetitorTable
                brandMetrics={brand_metrics as any}
                competitorMetrics={competitor_metrics as any}
            />
        </div>
    );
}
