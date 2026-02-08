/**
 * Available LLM models through OpenRouter
 */
export const AVAILABLE_MODELS = {
    'gpt-4o': {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        contextWindow: 128000,
    },
    'gpt-4o-mini': {
        id: 'openai/gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        contextWindow: 128000,
    },
    'claude-3-5-sonnet': {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        contextWindow: 200000,
    },
    'claude-3-5-haiku': {
        id: 'anthropic/claude-3.5-haiku',
        name: 'Claude 3.5 Haiku',
        provider: 'Anthropic',
        contextWindow: 200000,
    },
    'gemini-2-flash': {
        id: 'google/gemini-2.0-flash-001',
        name: 'Gemini 2.0 Flash',
        provider: 'Google',
        contextWindow: 1000000,
    },
    'gemini-pro': {
        id: 'google/gemini-pro-1.5',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        contextWindow: 1000000,
    },
    'llama-3-70b': {
        id: 'meta-llama/llama-3-70b-instruct',
        name: 'Llama 3 70B',
        provider: 'Meta',
        contextWindow: 8192,
    },
    'perplexity-sonar': {
        id: 'perplexity/sonar-pro',
        name: 'Perplexity Sonar Pro',
        provider: 'Perplexity',
        contextWindow: 127000,
    },
    'openai-o1': {
        id: 'openai/o1',
        name: 'OpenAI o1',
        provider: 'OpenAI',
        contextWindow: 128000,
    },
    'deepseek-r1': {
        id: 'deepseek/deepseek-r1',
        name: 'DeepSeek R1',
        provider: 'DeepSeek',
        contextWindow: 128000,
    },
} as const;

export type ModelKey = keyof typeof AVAILABLE_MODELS;
export type ModelConfig = (typeof AVAILABLE_MODELS)[ModelKey];

/**
 * Get all available models as an array
 */
export function getAvailableModels(): Array<ModelConfig & { key: ModelKey }> {
    return Object.entries(AVAILABLE_MODELS).map(([key, config]) => ({
        key: key as ModelKey,
        ...config,
    }));
}

/**
 * Get a model by its key
 */
export function getModel(key: ModelKey): ModelConfig {
    return AVAILABLE_MODELS[key];
}
