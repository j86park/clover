/**
 * Source Classifier
 * Categorize citation sources as owned, earned, or external
 */

export type SourceType = 'owned' | 'earned' | 'external';

export interface ClassificationContext {
    brandDomain?: string;
    competitorDomains?: string[];
}

/**
 * Known review and media sites (earned media)
 */
const EARNED_MEDIA_DOMAINS = new Set([
    // Review sites
    'g2.com',
    'capterra.com',
    'trustradius.com',
    'gartner.com',
    'forrester.com',
    'softwareadvice.com',
    'getapp.com',
    'trustpilot.com',
    'producthunt.com',

    // Tech media
    'techcrunch.com',
    'wired.com',
    'theverge.com',
    'arstechnica.com',
    'zdnet.com',
    'cnet.com',
    'venturebeat.com',
    'businessinsider.com',
    'forbes.com',
    'bloomberg.com',
    'reuters.com',

    // Dev/Tech communities
    'reddit.com',
    'news.ycombinator.com',
    'stackoverflow.com',
    'medium.com',
    'dev.to',
    'hashnode.com',

    // General media
    'nytimes.com',
    'wsj.com',
    'bbc.com',
    'cnn.com',
    'theguardian.com',
]);

/**
 * Helper to normalize a domain by removing protocol, www., and trailing slash
 */
function normalizeDomain(domain: string): string {
    return domain
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');
}

/**
 * Classify a source domain
 */
export function classifySource(
    domain: string,
    context: ClassificationContext
): SourceType {
    const normalizedDomain = normalizeDomain(domain);

    // Check if owned (matches brand domain)
    if (context.brandDomain) {
        const normalizedBrand = normalizeDomain(context.brandDomain);
        if (normalizedDomain === normalizedBrand || normalizedDomain.endsWith(`.${normalizedBrand}`)) {
            return 'owned';
        }
    }

    // Check if earned (known media/review site)
    if (EARNED_MEDIA_DOMAINS.has(normalizedDomain)) {
        return 'earned';
    }

    // Check partial matches for earned media (subdomains)
    for (const earnedDomain of EARNED_MEDIA_DOMAINS) {
        if (normalizedDomain.endsWith(`.${earnedDomain}`)) {
            return 'earned';
        }
    }

    // Everything else is external (including competitor domains)
    return 'external';
}

/**
 * Batch classify multiple domains
 */
export function classifySources(
    domains: string[],
    context: ClassificationContext
): Map<string, SourceType> {
    const results = new Map<string, SourceType>();

    for (const domain of domains) {
        results.set(domain, classifySource(domain, context));
    }

    return results;
}

/**
 * Get stats about source classifications
 */
export function getSourceStats(
    classifications: Map<string, SourceType>
): { owned: number; earned: number; external: number } {
    const stats = { owned: 0, earned: 0, external: 0 };

    for (const type of classifications.values()) {
        stats[type]++;
    }

    return stats;
}
