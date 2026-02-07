/**
 * CSV Export Utility
 * Generates downloadable CSV files from dashboard metrics
 */

export interface ExportData {
    metrics: {
        asov: number;
        aigvr: number;
        authority_score: number;
        sentiment_score: number;
        owned_citations: number;
        earned_citations: number;
        external_citations: number;
    };
    trends: { date: string; asov: number }[];
    competitors: { name: string; asov: number; aigvr: number }[];
}

/**
 * Generate CSV content from export data
 */
export function generateCSV(data: ExportData): string {
    const lines: string[] = [];

    // Section: Metrics
    lines.push('## Metrics');
    lines.push('metric,value');
    lines.push(`asov,${data.metrics.asov}`);
    lines.push(`aigvr,${data.metrics.aigvr}`);
    lines.push(`authority_score,${data.metrics.authority_score}`);
    lines.push(`sentiment_score,${data.metrics.sentiment_score}`);
    lines.push(`owned_citations,${data.metrics.owned_citations}`);
    lines.push(`earned_citations,${data.metrics.earned_citations}`);
    lines.push(`external_citations,${data.metrics.external_citations}`);
    lines.push('');

    // Section: Trends
    lines.push('## Trends');
    lines.push('date,asov');
    for (const trend of data.trends) {
        lines.push(`${trend.date},${trend.asov}`);
    }
    lines.push('');

    // Section: Competitors
    lines.push('## Competitors');
    lines.push('name,asov,aigvr');
    for (const comp of data.competitors) {
        // Escape names with commas
        const escapedName = comp.name.includes(',') ? `"${comp.name}"` : comp.name;
        lines.push(`${escapedName},${comp.asov},${comp.aigvr}`);
    }

    return lines.join('\n');
}

/**
 * Trigger browser download of CSV content
 */
export function downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
