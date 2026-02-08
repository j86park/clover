/**
 * PDF Export Utility
 * Generates branded PDF reports from dashboard metrics
 */

import jsPDF from 'jspdf';
import type { ExportData } from './csv';

/**
 * Generate a branded PDF report from export data
 */
export function generatePDFReport(
    brandName: string,
    data: ExportData,
    chartImages?: { trend?: string; authority?: string }
): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Colors
    const emerald = [16, 185, 129]; // #10B981
    const dark = [17, 24, 39]; // #111827
    const gray = [107, 114, 128]; // #6B7280

    // Header with branding
    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.rect(0, 0, pageWidth, 50, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('Brand Visibility Report', 20, 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(emerald[0], emerald[1], emerald[2]);
    doc.text(brandName, 20, 40);

    // Generation date (right aligned)
    doc.setFontSize(10);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    const dateText = `Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`;
    doc.text(dateText, pageWidth - 20, 40, { align: 'right' });

    // Reset text color
    doc.setTextColor(dark[0], dark[1], dark[2]);

    // Key Metrics Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Key Metrics', 20, 70);

    // Metrics table
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    const metrics = [
        ['AI Share of Voice (ASoV)', `${data.metrics.asov.toFixed(1)}%`],
        ['AI-Generated Visibility Rate (AIGVR)', `${data.metrics.aigvr.toFixed(1)}%`],
        ['Authority Score', `${data.metrics.authority_score.toFixed(2)}/3`],
        ['Sentiment Score', `${data.metrics.sentiment_score.toFixed(0)}/100`],
        ['Owned Citations', data.metrics.owned_citations.toString()],
        ['Earned Citations', data.metrics.earned_citations.toString()],
        ['External Citations', data.metrics.external_citations.toString()],
    ];

    let yPos = 82;
    for (const [label, value] of metrics) {
        doc.setTextColor(gray[0], gray[1], gray[2]);
        doc.text(label, 25, yPos);
        doc.setTextColor(dark[0], dark[1], dark[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(value, 140, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 10;
    }

    // Trend chart image (if provided as base64)
    if (chartImages?.trend) {
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Visibility Trend', 20, yPos);
        yPos += 5;

        try {
            doc.addImage(chartImages.trend, 'PNG', 20, yPos, 170, 70);
            yPos += 80;
        } catch {
            // Image failed to load, skip
        }
    }

    // Page 2: Historical Performance
    doc.addPage();
    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Historical Performance', 20, 20);

    doc.setTextColor(dark[0], dark[1], dark[2]);
    yPos = 50;

    // Table Header
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 6, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Date', 25, yPos);
    doc.text('ASoV', 70, yPos);
    doc.text('AIGVR', 100, yPos);
    doc.text('Auth (0-3)', 130, yPos);
    doc.text('Sentiment', 160, yPos);

    doc.setFont('helvetica', 'normal');
    yPos += 12;

    for (const run of data.history) {
        const runDate = new Date(run.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        doc.text(runDate, 25, yPos);
        doc.text(`${run.asov.toFixed(1)}%`, 70, yPos);
        doc.text(`${run.aigvr.toFixed(1)}%`, 100, yPos);
        doc.text(run.authority_score.toFixed(2), 130, yPos);
        doc.text(`${(run.sentiment_score * 100).toFixed(0)}%`, 160, yPos);

        yPos += 8;

        if (yPos > 270) {
            doc.addPage();
            yPos = 30;
        }
    }

    // Page 3: Competitor Analysis
    doc.addPage();

    // Header bar on page 3
    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Competitor Analysis', 20, 20);

    doc.setTextColor(dark[0], dark[1], dark[2]);

    // Competitor table header
    yPos = 50;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 6, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Brand', 25, yPos);
    doc.text('ASoV', 120, yPos);
    doc.text('AIGVR', 155, yPos);

    // Competitor rows
    doc.setFont('helvetica', 'normal');
    yPos += 12;

    for (const comp of data.competitors) {
        doc.text(comp.name.substring(0, 35), 25, yPos);
        doc.text(`${comp.asov.toFixed(1)}%`, 120, yPos);
        doc.text(`${comp.aigvr.toFixed(1)}%`, 155, yPos);
        yPos += 8;

        // Add new page if needed
        if (yPos > 270) {
            doc.addPage();
            yPos = 30;
        }
    }

    // Authority chart image (if provided)
    if (chartImages?.authority) {
        yPos += 15;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Authority Comparison', 20, yPos);
        yPos += 5;

        try {
            doc.addImage(chartImages.authority, 'PNG', 20, yPos, 170, 70);
        } catch {
            // Image failed to load, skip
        }
    }

    // Footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(gray[0], gray[1], gray[2]);
        doc.text(
            `Page ${i} of ${totalPages} • Generated by Clover Dashboard`,
            pageWidth / 2,
            290,
            { align: 'center' }
        );
    }

    return doc;
}

/**
 * Trigger browser download of PDF document
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    doc.save(finalFilename);
}
