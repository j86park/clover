import { queryLLM } from '../openrouter/client';

/**
 * Format raw query results into a natural language summary using an LLM.
 */
export async function formatQueryResult(data: any[], question: string): Promise<string> {
    if (!data || data.length === 0) {
        return "I couldn't find any data matching your request. Please try rephrasing or check if you have active collection runs.";
    }

    const systemPrompt = `
You are a Senior SEO Strategist and Data Analyst for Clover Intelligence.
Your goal is to provide deep, actionable insights based on the user's SEO performance data.

BRAND CONTEXT:
- ASoV (AI Share of Voice): How often the brand is mentioned by LLMs relative to competitors.
- AIGVR (AI-Generated Visibility Rate): The quality and prominence of these mentions.
- Authority Score: The brand's perceived expertise and reliability across data sources (0-3 scale).
- Sentiment: The emotional tone of mentions (-1 to 1).

TASK:
1. Analyze the provided data in the context of the user's question.
2. Provide a concise, friendly natural language summary.
3. If the user asks for tips, improvements, or "how-to", provide 2-3 specific, data-driven SEO recommendations.
4. If the data is positive, suggest how to maintain momentum. If negative, suggest specific corrective actions.

User Question: "${question}"
Data Context: ${JSON.stringify(data.slice(0, 15), null, 2)}
`;

    const result = await queryLLM('openai/gpt-4o-mini', [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "Please analyze this data and provide strategic recommendations if applicable." }
    ], { temperature: 0.6 });

    return result.content.trim();
}
