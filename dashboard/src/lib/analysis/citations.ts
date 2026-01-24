/**
 * Citation Extractor
 * Extract URLs and domains from text
 */

export interface ExtractedCitation {
    url: string;
    domain: string;
    raw_text: string;
}

/**
 * Extract domain from a URL
 */
export function extractDomain(url: string): string {
    try {
        // Handle URLs with or without protocol
        let urlToParse = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            urlToParse = `https://${url}`;
        }

        const parsed = new URL(urlToParse);
        // Remove www. prefix
        return parsed.hostname.replace(/^www\./, '');
    } catch {
        // If URL parsing fails, try to extract domain manually
        const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
        return match ? match[1].replace(/^www\./, '') : url;
    }
}

/**
 * Extract all URLs from text
 */
export function extractUrls(text: string): ExtractedCitation[] {
    const citations: ExtractedCitation[] = [];
    const seenDomains = new Set<string>();

    // Match full URLs (http/https)
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
    const urlMatches = text.match(urlRegex) || [];

    for (const url of urlMatches) {
        // Clean trailing punctuation
        const cleanedUrl = url.replace(/[.,;:!?)]+$/, '');
        const domain = extractDomain(cleanedUrl);

        if (!seenDomains.has(domain)) {
            seenDomains.add(domain);
            citations.push({
                url: cleanedUrl,
                domain,
                raw_text: cleanedUrl,
            });
        }
    }

    // Match domain-only mentions (e.g., "salesforce.com", "notion.so")
    const domainRegex = /\b([a-zA-Z0-9-]+\.(com|org|net|io|co|ai|so|app|dev|tech))\b/gi;
    const domainMatches = text.match(domainRegex) || [];

    for (const domain of domainMatches) {
        const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

        if (!seenDomains.has(normalizedDomain)) {
            seenDomains.add(normalizedDomain);
            citations.push({
                url: `https://${normalizedDomain}`,
                domain: normalizedDomain,
                raw_text: domain,
            });
        }
    }

    return citations;
}

/**
 * Check if text contains any URLs
 */
export function hasUrls(text: string): boolean {
    const urlRegex = /https?:\/\/[^\s]+/i;
    return urlRegex.test(text);
}
