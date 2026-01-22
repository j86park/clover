import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { queryLLM } from '@/lib/openrouter/client';
import { AVAILABLE_MODELS, type ModelKey } from '@/lib/openrouter/models';

// Force dynamic rendering 
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
    model: z.string(),
    prompt: z.string().min(1).max(10000),
    systemPrompt: z.string().optional(),
    maxTokens: z.number().optional(),
    temperature: z.number().min(0).max(2).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { model, prompt, systemPrompt, maxTokens, temperature } = requestSchema.parse(body);

        // Validate model exists
        const modelConfig = AVAILABLE_MODELS[model as ModelKey];
        if (!modelConfig) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Unknown model: ${model}`,
                    availableModels: Object.keys(AVAILABLE_MODELS),
                },
                { status: 400 }
            );
        }

        const messages = [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            { role: 'user' as const, content: prompt },
        ];

        const startTime = Date.now();
        const result = await queryLLM(modelConfig.id, messages, {
            maxTokens,
            temperature,
        });
        const latencyMs = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            data: {
                ...result,
                latencyMs,
            },
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request',
                    details: error.issues,
                },
                { status: 400 }
            );
        }

        console.error('LLM query error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to query LLM',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        success: true,
        models: AVAILABLE_MODELS,
        usage: {
            method: 'POST',
            body: {
                model: 'string (required) - one of the model keys',
                prompt: 'string (required) - the user prompt',
                systemPrompt: 'string (optional) - system prompt',
                maxTokens: 'number (optional) - max tokens to generate',
                temperature: 'number (optional) - temperature 0-2',
            },
        },
    });
}
