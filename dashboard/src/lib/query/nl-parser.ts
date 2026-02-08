import { queryLLM } from '../openrouter/client';
import { QueryIntent } from '@/types';

/**
 * Parse a natural language question into a QueryIntent object.
 */
export async function parseQueryIntent(question: string): Promise<QueryIntent> {
    const systemPrompt = `
You are a data analyst for an LLM SEO monitoring tool. 
Your task is to parse a natural language question into a structured JSON "intent".

Metrics:
- asov: Average Share of Voice
- aigvr: AI-Generated Visibility Rate
- sentiment: Sentiment score
- citations: Mention counts or citations

Time Ranges:
- last_week, last_month, last_quarter, all_time

Output Format (JSON only):
{
  "metricType": "asov" | "aigvr" | "sentiment" | "citations" | "general",
  "timeRange": "last_week" | "last_month" | "last_quarter" | "all_time",
  "comparison": string (optional, competitor name),
  "filters": { ... }
}

Examples:
- "What was my asov last week?" -> { "metricType": "asov", "timeRange": "last_week" }
- "How did I compare to Apple last month?" -> { "metricType": "general", "timeRange": "last_month", "comparison": "Apple" }
- "Who has the best sentiment?" -> { "metricType": "sentiment", "timeRange": "all_time" }
`;

    const result = await queryLLM('google/gemini-2.0-flash-001', [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
    ], { temperature: 0 });

    try {
        // Find JSON in response
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');

        const intent = JSON.parse(jsonMatch[0]);

        // Defaults
        return {
            metricType: intent.metricType || 'general',
            timeRange: intent.timeRange || 'last_month',
            comparison: intent.comparison,
            filters: intent.filters || {}
        };
    } catch (error) {
        console.error('Failed to parse query intent:', error);
        return {
            metricType: 'general',
            timeRange: 'last_month'
        };
    }
}
