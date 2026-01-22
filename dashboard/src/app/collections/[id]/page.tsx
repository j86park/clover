import { CompetitorTable } from '@/components/dashboard/competitor-table';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Heart, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
    const { id } = await params;

    // For now, show mock data
    // In Phase 6, this will fetch from API: /api/metrics/{id}
    const mockData = {
        collection_id: id,
        brand_metrics: {
            id: '1',
            collection_id: id,
            brand_id: 'brand-1',
            brand_name: 'Your Brand',
            asov: 45.2,
            aigvr: 62.5,
            sentiment_score: 0.72,
            authority_owned: 145,
            authority_earned: 187,
            authority_external: 55,
            created_at: new Date().toISOString(),
        },
        competitor_metrics: [
            {
                id: '2',
                collection_id: id,
                brand_id: 'competitor-1',
                brand_name: 'Competitor A',
                asov: 38.1,
                aigvr: 58.2,
                sentiment_score: 0.65,
                authority_owned: 120,
                authority_earned: 165,
                authority_external: 45,
                created_at: new Date().toISOString(),
            },
            {
                id: '3',
                collection_id: id,
                brand_id: 'competitor-2',
                brand_name: 'Competitor B',
                asov: 51.3,
                aigvr: 71.8,
                sentiment_score: 0.78,
                authority_owned: 165,
                authority_earned: 201,
                authority_external: 62,
                created_at: new Date().toISOString(),
            },
        ],
    };

    const { brand_metrics, competitor_metrics } = mockData;
    const totalAuthority = brand_metrics.authority_owned + brand_metrics.authority_earned + brand_metrics.authority_external;

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
                    value={`${brand_metrics.asov}%`}
                    icon={BarChart3}
                />
                <MetricCard
                    label="AI-Generated Visibility Rate"
                    value={`${brand_metrics.aigvr}%`}
                    icon={TrendingUp}
                />
                <MetricCard
                    label="Authority Score"
                    value={totalAuthority}
                    icon={Award}
                />
                <MetricCard
                    label="Sentiment Score"
                    value={`${(brand_metrics.sentiment_score * 100).toFixed(0)}%`}
                    icon={Heart}
                />
            </div>

            {/* Competitor Comparison */}
            <CompetitorTable
                brandMetrics={brand_metrics}
                competitorMetrics={competitor_metrics}
            />
        </div>
    );
}
