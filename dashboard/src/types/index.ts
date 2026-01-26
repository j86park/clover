/**
 * Core types for the LLM SEO Dashboard
 * These match the Supabase database schema (snake_case)
 */

export interface Brand {
    id: string;
    name: string;
    domain?: string | null;
    keywords: string[] | null;
    created_at: string;
    updated_at: string;
}

export interface Competitor {
    id: string;
    brand_id: string;
    name: string;
    domain?: string | null;
    created_at: string;
}

export interface Prompt {
    id: string;
    category: 'discovery' | 'comparison' | 'review';
    intent: string;
    template: string;
    is_active: boolean;
    created_at: string;
}

export interface Collection {
    id: string;
    brand_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    started_at?: string | null;
    completed_at?: string | null;
    created_at: string;
}

export interface LLMResponse {
    id: string;
    collection_id: string;
    prompt_id: string;
    model: string;
    prompt_text: string;
    response_text: string;
    tokens_used?: number | null;
    latency_ms?: number | null;
    created_at: string;
}

export interface Metrics {
    id: string;
    collection_id: string;
    brand_id: string;
    asov: number;  // Average Share of Voice (0-100)
    aigvr: number; // AI-Generated Visibility Rate (0-100)
    sentiment_score: number; // (-1 to 1)
    authority_owned: number;
    authority_earned: number;
    authority_external: number;
    created_at: string;
}

export interface CollectionMetrics {
    collection_id: string;
    brand_metrics: Metrics;
    competitor_metrics: Metrics[];
    comparison: {
        rankings: {
            asov_rank: number;
            aigvr_rank: number;
            sentiment_rank: number;
        };
        total_brands: number;
    };
}

export interface ApiKey {
    id: string;
    key_hash: string;
    key_prefix: string;
    name: string;
    tenant_id: string;
    permissions: string[];
    rate_limit: number;
    is_active: boolean;
    last_used_at?: string | null;
    created_at: string;
    expires_at?: string | null;
}

export interface AuditLog {
    id: string;
    user_id?: string | null;
    action: string;
    resource_type: string;
    resource_id?: string | null;
    details: Record<string, any>;
    created_at: string;
}

export interface TestRun {
    id: string;
    test_type: 'correlation' | 'ab' | 'semantic';
    configuration: Record<string, any>;
    status: 'pending' | 'running' | 'completed' | 'failed';
    results: Record<string, any>;
    created_at: string;
}


export * from './testing';
