/**
 * Prompt Template Engine
 * Handles variable substitution in prompt templates
 */

export interface PromptVariables {
    brand?: string;
    category?: string;
    competitor?: string;
    [key: string]: string | undefined;
}

/**
 * Extract variable names from a template string
 * Variables are in the format {variableName}
 */
export function extractVariables(template: string): string[] {
    const regex = /\{(\w+)\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
        if (!variables.includes(match[1])) {
            variables.push(match[1]);
        }
    }

    return variables;
}

/**
 * Check if all required variables are provided
 */
export function validateVariables(
    template: string,
    variables: PromptVariables
): { valid: boolean; missing: string[] } {
    const required = extractVariables(template);
    const missing = required.filter(v => !variables[v]);

    return {
        valid: missing.length === 0,
        missing,
    };
}

/**
 * Render a template with provided variables
 * Replaces {variableName} with the corresponding value
 */
export function renderPrompt(
    template: string,
    variables: PromptVariables
): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        const value = variables[key];
        return value !== undefined ? value : match;
    });
}

/**
 * Render a template and validate all variables are provided
 * Throws an error if any required variables are missing
 */
export function renderPromptStrict(
    template: string,
    variables: PromptVariables
): string {
    const validation = validateVariables(template, variables);

    if (!validation.valid) {
        throw new Error(`Missing required variables: ${validation.missing.join(', ')}`);
    }

    return renderPrompt(template, variables);
}
