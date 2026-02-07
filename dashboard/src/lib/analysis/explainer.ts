/**
 * Brand Mention Explainer
 * Uses follow-up LLM call to explain why a brand was recommended
 */

import OpenAI from 'openai';

// Lazy-load OpenAI client
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
    if (!openaiClient) {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openaiClient;
}

export interface ExplainRequest {
    originalPrompt: string;
    originalResponse: string;
    mentionedBrand: string;
    mentionContext?: string;
}

export interface MentionExplanation {
    brandName: string;
    reasoning: string;
    keyFactors: string[];
    confidence: 'high' | 'medium' | 'low';
    suggestions: string[];
}

const EXPLAINER_SYSTEM_PROMPT = `You are a brand visibility analyst. Analyze why a specific brand was mentioned or recommended in an AI response.

Respond with valid JSON matching this structure:
{
  "reasoning": "2-3 sentences explaining why this brand was recommended",
  "keyFactors": ["factor 1", "factor 2", "factor 3"],
  "confidence": "high" | "medium" | "low",
  "suggestions": ["suggestion 1", "suggestion 2"]
}

Be specific and actionable. Reference the actual content when explaining reasoning.`;

/**
 * Explain why a brand was mentioned in a response
 */
export async function explainMention(
    request: ExplainRequest
): Promise<MentionExplanation> {
    const { originalPrompt, originalResponse, mentionedBrand, mentionContext } = request;

    // Truncate long responses for efficiency
    const truncatedResponse = originalResponse.length > 1500
        ? originalResponse.substring(0, 1500) + '...'
        : originalResponse;

    const userPrompt = `The user asked: "${originalPrompt}"

The AI responded (mentioning ${mentionedBrand}):
"${truncatedResponse}"

${mentionContext ? `Context of mention: "${mentionContext}"` : ''}

Explain why ${mentionedBrand} was mentioned or recommended in this response. What factors likely influenced this? How could ${mentionedBrand} improve its visibility in similar queries?`;

    try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: EXPLAINER_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        const content = completion.choices[0]?.message?.content || '';
        const parsed = parseExplanationResponse(content);

        return {
            brandName: mentionedBrand,
            ...parsed,
        };
    } catch (error) {
        console.error('Explain mention failed:', error);
        return {
            brandName: mentionedBrand,
            reasoning: 'Unable to generate explanation at this time.',
            keyFactors: [],
            confidence: 'low',
            suggestions: [],
        };
    }
}

/**
 * Parse JSON response from LLM
 */
function parseExplanationResponse(content: string): Omit<MentionExplanation, 'brandName'> {
    try {
        // Remove markdown code blocks if present
        let cleaned = content.trim();
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.slice(7);
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.slice(3);
        }
        if (cleaned.endsWith('```')) {
            cleaned = cleaned.slice(0, -3);
        }

        const parsed = JSON.parse(cleaned.trim());

        return {
            reasoning: String(parsed.reasoning || ''),
            keyFactors: Array.isArray(parsed.keyFactors)
                ? parsed.keyFactors.map(String).slice(0, 5)
                : [],
            confidence: ['high', 'medium', 'low'].includes(parsed.confidence)
                ? parsed.confidence
                : 'medium',
            suggestions: Array.isArray(parsed.suggestions)
                ? parsed.suggestions.map(String).slice(0, 3)
                : [],
        };
    } catch {
        return {
            reasoning: content.substring(0, 300),
            keyFactors: [],
            confidence: 'low',
            suggestions: [],
        };
    }
}
