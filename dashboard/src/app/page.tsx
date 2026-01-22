import { MetricCard } from '@/components/dashboard/metric-card';
import { ASoVTrendChart } from '@/components/charts/asov-trend';
import { AuthorityHeatmap } from '@/components/charts/authority-heatmap';
import { BarChart3, TrendingUp, Heart, Award } from 'lucide-react';

export default async function Home() {
  // For now, we'll show placeholder data
  // In Phase 6, this will fetch from the latest collection via API
  const metrics = {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your brand's LLM SEO performance
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Average Share of Voice"
          value={`${metrics.asov}%`}
          trend={metrics.trends.asov}
          icon={BarChart3}
        />
        <MetricCard
          label="AI-Generated Visibility Rate"
          value={`${metrics.aigvr}%`}
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
          value={`${(metrics.sentiment * 100).toFixed(0)}%`}
          trend={metrics.trends.sentiment}
          icon={Heart}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <ASoVTrendChart />
        <AuthorityHeatmap />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
        <p className="text-muted-foreground">
          Start a new collection to gather fresh data and calculate metrics for your brand.
        </p>
      </div>
    </div>
  );
}
