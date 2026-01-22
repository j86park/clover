import OpenAI from 'openai';

/**
 * Get the OpenRouter client (lazy initialization)
 * This prevents errors during build when API key is not available
 */
let _openrouter: OpenAI | null = null;

export function getOpenRouterClient(): OpenAI {
    if (!_openrouter) {
        _openrouter = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                'X-Title': 'LLM SEO Dashboard',
            },
        });
    }
    return _openrouter;
}

export type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

export interface LLMQueryResult {
    content: string;
    model: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * Query an LLM model through OpenRouter
 */
export async function queryLLM(
    model: string,
    messages: ChatMessage[],
    options?: { maxTokens?: number; temperature?: number }
): Promise<LLMQueryResult> {
    const openrouter = getOpenRouterClient();

    const response = await openrouter.chat.completions.create({
        model,
        messages,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
    });

    return {
        content: response.choices[0]?.message?.content || '',
        model: response.model,
        usage: response.usage
            ? {
                prompt_tokens: response.usage.prompt_tokens,
                completion_tokens: response.usage.completion_tokens,
                total_tokens: response.usage.total_tokens,
            }
            : undefined,
    };
}
