/**
 * Core types for the LLM SEO Dashboard
 */

export interface Brand {
    id: string;
    name: string;
    domain?: string;
    keywords: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Competitor {
    id: string;
    brandId: string;
    name: string;
    domain?: string;
    createdAt: Date;
}

export interface Prompt {
    id: string;
    category: 'discovery' | 'comparison' | 'review';
    intent: string;
    template: string;
    isActive: boolean;
    createdAt: Date;
}

export interface Collection {
    id: string;
    brandId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
}

export interface LLMResponse {
    id: string;
    collectionId: string;
    promptId: string;
    model: string;
    promptText: string;
    responseText: string;
    tokensUsed?: number;
    latencyMs?: number;
    createdAt: Date;
}
