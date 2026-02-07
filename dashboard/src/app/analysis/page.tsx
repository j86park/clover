import { createServerClient } from '@/lib/supabase';
import { AnalysisList } from '@/components/dashboard/analysis-list';
import { PromptEffectivenessCard } from '@/components/analysis/prompt-effectiveness-card';
import { ModelBreakdownSection } from '@/components/analysis/model-breakdown-section';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ collection_id?: string }>;
}

export default async function AnalysisPage({ searchParams }: PageProps) {
    const { collection_id } = await searchParams;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch analyses for the user's brand
    let query = supabase
        .from('analysis')
        .select(`
            *,
            responses!inner (
                model,
                prompt_text,
                response_text,
                collections!inner (
                    id,
                    brand_id,
                    brands!inner (
                        user_id
                    )
                )
            )
        `)
        .eq('responses.collections.brands.user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (collection_id) {
        query = query.eq('responses.collections.id', collection_id);
    }

    const { data: analyses, error } = await query;

    if (error) {
        console.error('Error fetching analyses:', error.message, error.hint, error.details);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analysis Bench</h1>
                <p className="text-muted-foreground">
                    Deep dive into LLM extraction results, brand mentions, and citation evidence.
                </p>
            </div>

            {/* Prompt Effectiveness Section */}
            <PromptEffectivenessCard />

            {/* Model Comparison Section */}
            <ModelBreakdownSection collectionId={collection_id} />

            <AnalysisList analyses={(analyses || []) as any} />
        </div>
    );
}
