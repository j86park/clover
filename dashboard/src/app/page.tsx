import { MetricCard } from '@/components/dashboard/metric-card';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { ExportButtons } from '@/components/dashboard/export-buttons';
import { RecommendationsPanel } from '@/components/dashboard/recommendations-panel';
import { BarChart3, TrendingUp, Heart, Award } from 'lucide-react';
import { createServerClient } from '@/lib/supabase';
import { getCollectionMetrics } from '@/lib/metrics/pipeline';
import type { ExportData } from '@/lib/export';

export default async function Home() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch the user's primary brand
  const { data: brand } = await supabase
    .from('brands')
    .select('id, name')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

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
  let chartData: { date: string; asov: number }[] = [];
  let authorityData = { owned: 0, earned: 0, external: 0 };
  let currentCollectionId = '';

  let metricsHistory: any[] = [];
  if (brand) {
    // 2. Fetch all historical metrics for this brand ordered by created_at descending
    const { data } = await supabase
      .from('metrics')
      .select('*')
      .eq('brand_id', brand.id)
      .order('created_at', { ascending: false });

    metricsHistory = data || [];

    if (metricsHistory.length > 0) {
      const latest = metricsHistory[0];
      const previous = metricsHistory[1]; // undefined if only one run

      currentCollectionId = latest.collection_id;

      // Calculate trends if previous data exists
      const calculateTrend = (curr: number, prev: number | undefined) => {
        if (prev === undefined || prev === 0) return 0;
        return ((curr - prev) / prev) * 100;
      };

      metrics = {
        asov: latest.asov,
        aigvr: latest.aigvr,
        authority: latest.authority_score,
        sentiment: latest.sentiment_score,
        trends: {
          asov: calculateTrend(latest.asov, previous?.asov),
          aigvr: calculateTrend(latest.aigvr, previous?.aigvr),
          authority: calculateTrend(latest.authority_score, previous?.authority_score),
          sentiment: calculateTrend(latest.sentiment_score, previous?.sentiment_score),
        }
      };

      authorityData = {
        owned: latest.owned_citations || 0,
        earned: latest.earned_citations || 0,
        external: latest.external_citations || 0,
      };

      // Full historical trend for the chart (chronological order)
      chartData = [...metricsHistory].reverse().map((r: any) => ({
        date: r.created_at,
        asov: r.asov
      }));

      hasData = true;
    }
  }

  // Fallback to placeholder data if no real data exists yet
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

  // Prepare export data
  const exportData: ExportData = {
    metrics: {
      asov: metrics.asov,
      aigvr: metrics.aigvr,
      authority_score: metrics.authority,
      sentiment_score: hasData ? (metrics.sentiment + 1) / 2 * 100 : metrics.sentiment * 100,
      owned_citations: authorityData.owned,
      earned_citations: authorityData.earned,
      external_citations: authorityData.external,
    },
    trends: chartData,
    competitors: [], // TODO: Add competitor data when available
    history: hasData ? metricsHistory.map((r: any) => ({
      date: r.created_at,
      asov: r.asov,
      aigvr: r.aigvr,
      authority_score: r.authority_score,
      sentiment_score: r.sentiment_score
    })) : [],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {hasData ? `AI SEO performance for ${brand?.name}` : "Overview of your brand's LLM SEO performance"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasData && (
            <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-full border border-green-500/20">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Live Metrics Enabled</span>
            </div>
          )}
          <ExportButtons brandName={brand?.name || 'Brand'} data={exportData} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Average Share of Voice"
          value={`${parseFloat(metrics.asov.toFixed(2))}%`}
          trend={metrics.trends.asov}
          icon={BarChart3}
        />
        <MetricCard
          label="AI Visibility Rate"
          value={`${parseFloat(metrics.aigvr.toFixed(2))}%`}
          trend={metrics.trends.aigvr}
          icon={TrendingUp}
        />
        <MetricCard
          label="Authority Score"
          value={hasData ? parseFloat(metrics.authority.toFixed(2)) : metrics.authority}
          trend={metrics.trends.authority}
          icon={Award}
        />
        <MetricCard
          label="Sentiment Score"
          value={`${parseFloat((hasData ? (metrics.sentiment + 1) / 2 * 100 : metrics.sentiment * 100).toFixed(2))}%`}
          trend={metrics.trends.sentiment}
          icon={Heart}
        />
      </div>

      {/* Interactive Charts & Modal Section */}
      <DashboardClient
        collectionId={currentCollectionId}
        chartData={chartData}
        authorityData={authorityData}
      />

      {/* Recommendations Section */}
      <RecommendationsPanel />

      {!hasData && (
        <div className="rounded-lg border bg-card p-6 border-dashed">
          <h2 className="text-xl font-semibold mb-2">No Live Data Found</h2>
          <p className="text-muted-foreground mb-4">
            You haven't completed any data collections for **Clover Labs** yet.
            The metrics above are currently demonstration placeholders.
          </p>
          <div className="flex gap-4">
            <a
              href="/collections"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
            >
              Go to Collections
            </a>
            <a
              href="/onboarding"
              className="text-primary hover:underline text-sm font-medium flex items-center"
            >
              View Onboarding Guide →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
