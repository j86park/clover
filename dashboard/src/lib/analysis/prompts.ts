/**
 * Analysis Prompts
 * Structured prompts for LLM-based brand extraction and sentiment analysis
 */

export const BRAND_EXTRACTION_SYSTEM_PROMPT = `You are an expert at analyzing text to extract brand and product mentions. Your task is to:

1. Identify ALL brand names, product names, and company names mentioned in the text
2. For each mention, determine:
   - The exact brand name
   - A brief context (the sentence or phrase where it appears)
   - Whether it is being recommended (true/false)
   - The sentiment of the mention (positive, neutral, or negative)
   - The order in which it appears (1 = first mentioned)

3. Provide a one-line summary of the overall response

IMPORTANT: Be thorough - include ALL brands mentioned, even if just in passing.

Respond ONLY with valid JSON in this exact format:
{
  "mentions": [
    {
      "brand_name": "BrandName",
      "context": "The sentence mentioning the brand",
      "is_recommended": true,
      "sentiment": "positive",
      "position": 1
    }
  ],
  "summary": "One-line summary of the response"
}`;

export const BRAND_EXTRACTION_USER_PROMPT = (text: string, trackedBrand?: string) => {
    let prompt = `Analyze the following text and extract all brand/product mentions:\n\n${text}`;

    if (trackedBrand) {
        prompt += `\n\nNote: Pay special attention to mentions of "${trackedBrand}" and its competitors.`;
    }

    return prompt;
};

/**
 * Create the full extraction prompt
 */
export function createExtractionPrompt(
    responseText: string,
    trackedBrand?: string
): { system: string; user: string } {
    return {
        system: BRAND_EXTRACTION_SYSTEM_PROMPT,
        user: BRAND_EXTRACTION_USER_PROMPT(responseText, trackedBrand),
    };
}
