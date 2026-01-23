/**
 * LLM-as-a-Judge Prompts
 * System prompts and template generators for the evaluation system
 */

export const JUDGE_SYSTEM_PROMPT = `
You are an expert impartial judge evaluating the quality of AI-generated responses.
Your goal is to provide fair, rigorous, and consistent scores based on specific criteria.
You must output your evaluation in valid JSON format.
Always explain your reasoning clearly before assigning scores.
`.trim();

export function createJudgePrompt(
    response: string,
    input: string,
    criteria: Record<string, unknown>,
    expectedOutput?: string | string[]
): string {
    return `
### Input Prompt
${input}

### AI Response to Evaluate
${response}

### Expected Elements (Ground Truth)
${expectedOutput ? (Array.isArray(expectedOutput) ? expectedOutput.join('\n- ') : expectedOutput) : 'None provided'}

### Evaluation Criteria
${JSON.stringify(criteria, null, 2)}

### Instructions
1. Analyze the response against the criteria and expected elements.
2. Determine if the response is relevant to the input prompt.
3. Check for factual accuracy if grounded truth is provided.
4. Assess completeness and tone.
5. Assign a score from 0-100 for each applicable dimension.

Output JSON format:
{
  "relevance": number,
  "accuracy": number,
  "completeness": number,
  "reasoning": "string explanation",
  "overall_score": number
}
`.trim();
}
