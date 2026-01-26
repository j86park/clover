'use server';

import { createClient } from '@/lib/supabase/server';
import { Citation } from '@/types/analysis';

/**
 * Fetches sample citations for a specific category
 */
export async function getSampleCitations(
    collectionId: string,
    type: 'owned' | 'earned' | 'external'
): Promise<Citation[]> {
    const supabase = await createClient();

    // 1. Fetch all analysis records for this collection
    const { data: analyses, error } = await supabase
        .from('analysis')
        .select('citations, responses!inner(collection_id)')
        .eq('responses.collection_id', collectionId);

    if (error || !analyses) {
        console.error('Failed to fetch citations:', error);
        return [];
    }

    // 2. Flatten and filter by type
    const allCitations: Citation[] = analyses.flatMap(a => (a.citations as unknown as Citation[]) || []);
    const filtered = allCitations.filter(c => c.source_type === type);

    // 3. De-duplicate by URL and take top 5
    const unique = Array.from(new Map(filtered.map(c => [c.url, c])).values());

    return unique.slice(0, 5);
}
