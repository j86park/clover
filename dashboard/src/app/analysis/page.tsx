import { createServerClient } from '@/lib/supabase';
import { AnalysisList } from '@/components/dashboard/analysis-list';

export const dynamic = 'force-dynamic';

export default async function AnalysisPage() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch analyses for the user's brand
    const { data: analyses, error } = await supabase
        .from('analysis')
        .select(`
            *,
            responses!inner (
                model,
                prompt_text,
                response_text,
                collections!inner (
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

            <AnalysisList analyses={(analyses || []) as any} />
        </div>
    );
}
