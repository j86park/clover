import { queryLLM } from '../openrouter/client';

/**
 * Format raw query results into a natural language summary using an LLM.
 */
export async function formatQueryResult(data: any[], question: string): Promise<string> {
    if (!data || data.length === 0) {
        return "I couldn't find any data matching your request. Please try rephrasing or check if you have active collection runs.";
    }

    const systemPrompt = `
You are a helpful data analyst. 
Given a user's question and the raw data results, provide a concise, friendly natural language summary of the answer.
The summary should be Professional but accessible. Avoid raw JSON.

User Question: "${question}"
Data: ${JSON.stringify(data.slice(0, 10), null, 2)}
`;

    const result = await queryLLM('google/gemini-2.0-flash-001', [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "Please summarize the findings from this data." }
    ], { temperature: 0.5 });

    return result.content.trim();
}
