---
phase: 16
plan: 3
wave: 2
---

# Plan 16.3: Export to PDF/CSV

## Objective
Enable one-click export of dashboard metrics and trends to PDF (branded report) and CSV (raw data for analysis). This is essential for enterprise adoption where marketing teams present to stakeholders.

## Context
- .gsd/SPEC.md
- dashboard/src/app/page.tsx — main dashboard with metrics
- dashboard/src/lib/metrics/pipeline.ts — metric aggregation
- dashboard/src/components/dashboard/ — chart components

## Tasks

<task type="auto">
  <name>Create CSV export utility</name>
  <files>
    dashboard/src/lib/export/csv.ts (new)
    dashboard/src/lib/export/index.ts (new)
  </files>
  <action>
    1. Create csv.ts:
       ```typescript
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
       
       export function generateCSV(data: ExportData): string {
         // Generate CSV with sections:
         // ## Metrics
         // metric,value
         // asov,45.2
         // ...
         // ## Trends
         // date,asov
         // 2026-02-01,42.1
         // ...
         // ## Competitors
         // name,asov,aigvr
         // ...
       }
       
       export function downloadCSV(content: string, filename: string) {
         // Create blob, create download link, trigger click
       }
       ```
    
    2. Create index.ts to export csv utilities
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>CSV generator produces valid comma-separated output</done>
</task>

<task type="auto">
  <name>Create PDF export utility</name>
  <files>
    dashboard/src/lib/export/pdf.ts (new)
    dashboard/package.json (add jspdf dependency)
  </files>
  <action>
    1. Install jspdf: npm install jspdf
    
    2. Create pdf.ts:
       ```typescript
       import jsPDF from 'jspdf';
       
       export function generatePDFReport(
         brandName: string,
         data: ExportData,
         chartImages?: { trend?: string; authority?: string }
       ): jsPDF {
         const doc = new jsPDF();
         
         // Header with branding
         doc.setFontSize(24);
         doc.text('Brand Visibility Report', 20, 30);
         doc.setFontSize(14);
         doc.text(brandName, 20, 40);
         doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 48);
         
         // Metrics table
         doc.setFontSize(16);
         doc.text('Key Metrics', 20, 65);
         // ... add metrics as table
         
         // Chart images (if provided as base64)
         if (chartImages?.trend) {
           doc.addImage(chartImages.trend, 'PNG', 20, 100, 170, 80);
         }
         
         // Competitor comparison
         doc.addPage();
         doc.text('Competitor Analysis', 20, 30);
         // ... competitor table
         
         return doc;
       }
       
       export function downloadPDF(doc: jsPDF, filename: string) {
         doc.save(filename);
       }
       ```
  </action>
  <verify>npm install && npx tsc --noEmit</verify>
  <done>PDF generator creates multi-page branded report</done>
</task>

<task type="auto">
  <name>Add export buttons to dashboard</name>
  <files>
    dashboard/src/components/dashboard/export-buttons.tsx (new)
    dashboard/src/components/dashboard/dashboard-client.tsx
    dashboard/src/app/page.tsx
  </files>
  <action>
    1. Create ExportButtons component:
       - "Export CSV" button with download icon
       - "Export PDF" button with document icon
       - Loading states during generation
       - Use toast notifications for success/error
    
    2. Integrate into dashboard-client.tsx:
       - Add ExportButtons at top of dashboard
       - Pass current metrics/data to export functions
       - For PDF charts: use html2canvas or pass chart data
    
    3. Style with Emerald theme:
       - Outlined buttons in dashboard header area
       - Icons from lucide-react (Download, FileText)
  </action>
  <verify>npm run build && npm run dev</verify>
  <done>Dashboard has visible export buttons that download files on click</done>
</task>

## Success Criteria
- [ ] CSV export downloads valid file with metrics, trends, competitors
- [ ] PDF export creates branded multi-page report
- [ ] Export buttons visible on main dashboard
- [ ] Files download with correct filenames (brand-name-report-YYYY-MM-DD.csv/pdf)
- [ ] TypeScript compiles without errors
