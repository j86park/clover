import { MetricCard } from '@/components/dashboard/metric-card';
import { ASoVTrendChart } from '@/components/charts/asov-trend';
import { AuthorityHeatmap } from '@/components/charts/authority-heatmap';
import { BarChart3, TrendingUp, Heart, Award } from 'lucide-react';
import { createServerClient } from '@/lib/supabase';
import { getCollectionMetrics } from '@/lib/metrics/pipeline';

export default async function Home() {
  const supabase = await createServerClient();

  // 1. Fetch the Clover Labs brand
  const { data: brand } = await supabase
    .from('brands')
    .select('id, name')
    .eq('name', 'Clover Labs')
    .single();

  let metrics = {
    asov: 0,
    aigvr: 0,
    authority: 0,
    sentiment: 0,
    trends: {
      asov: 0,
      aigvr: 0,
      authority: 0,
      sentiment: 0,
    }
  };

  let hasData = false;

  if (brand) {
    // 2. Get the latest completed collection for this brand
    const { data: collection } = await supabase
      .from('collections')
      .select('id')
      .eq('brand_id', brand.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (collection) {
      const collectionMetrics = await getCollectionMetrics(collection.id);
      if (collectionMetrics) {
        const bm = collectionMetrics.brand_metrics;
        metrics = {
          asov: bm.asov,
          aigvr: bm.aigvr,
          authority: bm.authority_score,
          sentiment: bm.sentiment_score,
          trends: {
            asov: 0, // In Phase 10 we'll add historical comparison
            aigvr: 0,
            authority: 0,
            sentiment: 0,
          }
        };
        hasData = true;
      }
    }
  }

  // Fallback to placeholder data if no real data exists yet
  // This helps show the dashboard before the first collection run
  if (!hasData) {
    metrics = {
      asov: 45.2,
      aigvr: 62.5,
      authority: 387,
      sentiment: 0.72,
      trends: {
        asov: 5.3,
        aigvr: -2.1,
        authority: 12.5,
        sentiment: 8.0,
      }
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {hasData ? `Real-time AI SEO performance for ${brand?.name}` : "Overview of your brand's LLM SEO performance"}
          </p>
        </div>
        {hasData && (
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-muted-foreground">Live Data Enabled</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Average Share of Voice"
          value={`${metrics.asov}${hasData ? '%' : '%'}`}
          trend={metrics.trends.asov}
          icon={BarChart3}
        />
        <MetricCard
          label="AI-Generated Visibility Rate"
          value={`${metrics.aigvr}${hasData ? '%' : '%'}`}
          trend={metrics.trends.aigvr}
          icon={TrendingUp}
        />
        <MetricCard
          label="Authority Score"
          value={metrics.authority}
          trend={metrics.trends.authority}
          icon={Award}
        />
        <MetricCard
          label="Sentiment Score"
          value={`${(metrics.sentiment * (hasData ? 1 : 100)).toFixed(hasData ? 1 : 0)}%`}
          trend={metrics.trends.sentiment}
          icon={Heart}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <ASoVTrendChart />
        <AuthorityHeatmap />
      </div>

      {!hasData && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <p className="text-muted-foreground mb-4">
            Start a new collection to gather fresh data and calculate metrics for your brand.
          </p>
          <a
            href="/onboarding"
            className="text-primary hover:underline text-sm font-medium"
          >
            New here? View the onboarding guide →
          </a>
        </div>
      )}
    </div>
  );
}
