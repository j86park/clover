import { UsageClient } from '@/components/usage/usage-client';
import { getApiUsageStats } from '@/app/actions/usage';

export const dynamic = 'force-dynamic';

export default async function UsagePage() {
    const stats = await getApiUsageStats();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">API Usage</h1>
                <p className="text-muted-foreground">
                    Monitor your API usage and performance metrics
                </p>
            </div>

            <UsageClient stats={stats} />
        </div>
    );
}
