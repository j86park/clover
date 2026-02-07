/**
 * Citation Network Builder
 * Creates graph data structure for visualizing citation relationships
 */

import { createServerClient } from '@/lib/supabase';
import { classifySource, type SourceType } from '@/lib/analysis/classifier';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface NetworkNode {
    id: string;
    type: 'source' | 'brand';
    label: string;
    sourceType?: SourceType;
    mentionCount: number;
    domain?: string;
}

export interface NetworkEdge {
    source: string;
    target: string;
    weight: number;
    responseIds: string[];
}

export interface NetworkStats {
    totalSources: number;
    owned: number;
    earned: number;
    external: number;
    topSources: Array<{ domain: string; count: number; type: SourceType }>;
}

export interface CitationNetwork {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
    stats: NetworkStats;
    brandName: string;
    generatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Build citation network graph data for visualization
 * @param brandId - The brand to build network for
 * @returns Graph structure with nodes, edges, and stats
 */
export async function buildCitationNetwork(
    brandId: string
): Promise<CitationNetwork> {
    const supabase = await createServerClient();

    // 1. Get brand info
    const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('id, name, domain')
        .eq('id', brandId)
        .single();

    if (brandError || !brand) {
        console.error('Error fetching brand:', brandError);
        return {
            nodes: [],
            edges: [],
            stats: { totalSources: 0, owned: 0, earned: 0, external: 0, topSources: [] },
            brandName: 'Unknown',
            generatedAt: new Date().toISOString(),
        };
    }

    // 2. Get all collections for this brand
    const { data: collections } = await supabase
        .from('collections')
        .select('id')
        .eq('brand_id', brandId)
        .eq('status', 'completed');

    if (!collections || collections.length === 0) {
        return {
            nodes: [{ id: 'brand', type: 'brand', label: brand.name, mentionCount: 0 }],
            edges: [],
            stats: { totalSources: 0, owned: 0, earned: 0, external: 0, topSources: [] },
            brandName: brand.name,
            generatedAt: new Date().toISOString(),
        };
    }

    const collectionIds = collections.map((c: { id: string }) => c.id);

    // 3. Get all analysis results with citations
    const { data: analyses, error: analysesError } = await supabase
        .from('analysis')
        .select(`
            id,
            response_id,
            citations,
            responses!inner (
                id,
                collection_id
            )
        `)
        .in('responses.collection_id', collectionIds);

    if (analysesError || !analyses || analyses.length === 0) {
        return {
            nodes: [{ id: 'brand', type: 'brand', label: brand.name, mentionCount: 0 }],
            edges: [],
            stats: { totalSources: 0, owned: 0, earned: 0, external: 0, topSources: [] },
            brandName: brand.name,
            generatedAt: new Date().toISOString(),
        };
    }

    // 4. Aggregate citations by domain
    interface DomainData {
        domain: string;
        count: number;
        responseIds: Set<string>;
        sourceType: SourceType;
    }

    const domainMap = new Map<string, DomainData>();

    for (const analysis of analyses) {
        const citations = analysis.citations || [];
        const responseId = analysis.response_id;

        for (const citation of citations) {
            const domain = citation.domain?.toLowerCase() || 'unknown';

            if (!domainMap.has(domain)) {
                const sourceType = classifySource(domain, {
                    brandDomain: brand.domain,
                    competitorDomains: [],
                });

                domainMap.set(domain, {
                    domain,
                    count: 0,
                    responseIds: new Set(),
                    sourceType,
                });
            }

            const data = domainMap.get(domain)!;
            data.count++;
            data.responseIds.add(responseId);
        }
    }

    // 5. Build nodes and edges (limit to top 50 sources)
    const sortedDomains = Array.from(domainMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

    // Create brand node
    const brandNode: NetworkNode = {
        id: 'brand',
        type: 'brand',
        label: brand.name,
        mentionCount: sortedDomains.reduce((sum, d) => sum + d.count, 0),
    };

    // Create source nodes
    const sourceNodes: NetworkNode[] = sortedDomains.map((d) => ({
        id: `source-${d.domain}`,
        type: 'source' as const,
        label: d.domain,
        sourceType: d.sourceType,
        mentionCount: d.count,
        domain: d.domain,
    }));

    // Create edges (source → brand)
    const edges: NetworkEdge[] = sortedDomains.map((d) => ({
        source: `source-${d.domain}`,
        target: 'brand',
        weight: d.count,
        responseIds: Array.from(d.responseIds),
    }));

    // 6. Calculate stats
    const stats: NetworkStats = {
        totalSources: domainMap.size,
        owned: 0,
        earned: 0,
        external: 0,
        topSources: sortedDomains.slice(0, 10).map((d) => ({
            domain: d.domain,
            count: d.count,
            type: d.sourceType,
        })),
    };

    for (const d of domainMap.values()) {
        stats[d.sourceType]++;
    }

    return {
        nodes: [brandNode, ...sourceNodes],
        edges,
        stats,
        brandName: brand.name,
        generatedAt: new Date().toISOString(),
    };
}
