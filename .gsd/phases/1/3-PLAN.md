---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: OpenRouter Integration

## Objective

Create the OpenRouter client abstraction for querying multiple LLM providers through a unified interface.

## Context

- .gsd/SPEC.md
- .gsd/phases/1/RESEARCH.md
- src/lib/openrouter/

## Tasks

<task type="auto">
  <name>Install OpenAI Package</name>
  <files>
    - package.json
  </files>
  <action>
    Install the OpenAI SDK (used with OpenRouter):
    
    ```bash
    npm install openai zod
    ```
    
    - `openai` — SDK that works with OpenRouter's API
    - `zod` — Schema validation for request/response types
  </action>
  <verify>npm list openai zod</verify>
  <done>Both packages appear in npm list output</done>
</task>

<task type="auto">
  <name>Create OpenRouter Client</name>
  <files>
    - src/lib/openrouter/client.ts
    - src/lib/openrouter/models.ts
  </files>
  <action>
    **client.ts** — OpenRouter client wrapper:
    ```typescript
    import OpenAI from 'openai';
    
    export const openrouter = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'LLM SEO Dashboard',
      },
    });
    
    export type ChatMessage = {
      role: 'system' | 'user' | 'assistant';
      content: string;
    };
    
    export async function queryLLM(
      model: string,
      messages: ChatMessage[],
      options?: { maxTokens?: number; temperature?: number }
    ) {
      const response = await openrouter.chat.completions.create({
        model,
        messages,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
      });
      
      return {
        content: response.choices[0]?.message?.content || '',
        model: response.model,
        usage: response.usage,
      };
    }
    ```
    
    **models.ts** — Available models configuration:
    ```typescript
    export const AVAILABLE_MODELS = {
      'gpt-4o': {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        contextWindow: 128000,
      },
      'claude-3-5-sonnet': {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        contextWindow: 200000,
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
    } as const;
    
    export type ModelKey = keyof typeof AVAILABLE_MODELS;
    export type ModelConfig = typeof AVAILABLE_MODELS[ModelKey];
    ```
  </action>
  <verify>npx tsc --noEmit src/lib/openrouter/client.ts src/lib/openrouter/models.ts</verify>
  <done>TypeScript compiles both files without errors</done>
</task>

<task type="auto">
  <name>Create LLM API Route</name>
  <files>
    - src/app/api/llm/route.ts
  </files>
  <action>
    Create a Next.js Route Handler for LLM queries:
    
    ```typescript
    import { NextRequest, NextResponse } from 'next/server';
    import { z } from 'zod';
    import { queryLLM } from '@/lib/openrouter/client';
    import { AVAILABLE_MODELS, type ModelKey } from '@/lib/openrouter/models';
    
    const requestSchema = z.object({
      model: z.string(),
      prompt: z.string().min(1).max(10000),
      systemPrompt: z.string().optional(),
    });
    
    export async function POST(request: NextRequest) {
      try {
        const body = await request.json();
        const { model, prompt, systemPrompt } = requestSchema.parse(body);
        
        // Validate model exists
        const modelConfig = AVAILABLE_MODELS[model as ModelKey];
        if (!modelConfig) {
          return NextResponse.json(
            { error: `Unknown model: ${model}` },
            { status: 400 }
          );
        }
        
        const messages = [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ];
        
        const result = await queryLLM(modelConfig.id, messages);
        
        return NextResponse.json({
          success: true,
          data: result,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Invalid request', details: error.errors },
            { status: 400 }
          );
        }
        
        console.error('LLM query error:', error);
        return NextResponse.json(
          { error: 'Failed to query LLM' },
          { status: 500 }
        );
      }
    }
    ```
    
    This route:
    - Validates input with Zod
    - Maps model keys to OpenRouter model IDs
    - Returns structured response with usage data
  </action>
  <verify>npx tsc --noEmit src/app/api/llm/route.ts</verify>
  <done>Route Handler compiles without TypeScript errors</done>
</task>

## Success Criteria

- [ ] OpenAI and Zod packages installed
- [ ] OpenRouter client works with all 4 configured models
- [ ] API route validates requests and returns proper error responses
