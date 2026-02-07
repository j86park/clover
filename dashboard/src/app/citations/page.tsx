import { CitationGraph } from '@/components/visualization/citation-graph';

export const dynamic = 'force-dynamic';

export default function CitationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Citation Network</h1>
                <p className="text-muted-foreground">
                    Visualize which sources cite your brand in AI responses.
                </p>
            </div>

            <CitationGraph />
        </div>
    );
}
