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
