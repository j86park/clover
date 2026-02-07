'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { generateCSV, downloadCSV, generatePDFReport, downloadPDF } from '@/lib/export';
import type { ExportData } from '@/lib/export';

interface ExportButtonsProps {
    brandName: string;
    data: ExportData;
}

export function ExportButtons({ brandName, data }: ExportButtonsProps) {
    const [exportingCSV, setExportingCSV] = React.useState(false);
    const [exportingPDF, setExportingPDF] = React.useState(false);

    const getFilename = (extension: 'csv' | 'pdf') => {
        const date = new Date().toISOString().split('T')[0];
        const safeBrandName = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `${safeBrandName}-report-${date}.${extension}`;
    };

    const handleExportCSV = async () => {
        setExportingCSV(true);
        try {
            // Small delay for UX feedback
            await new Promise(resolve => setTimeout(resolve, 200));
            const csvContent = generateCSV(data);
            downloadCSV(csvContent, getFilename('csv'));
        } catch (error) {
            console.error('CSV export failed:', error);
        } finally {
            setExportingCSV(false);
        }
    };

    const handleExportPDF = async () => {
        setExportingPDF(true);
        try {
            // Small delay for UX feedback
            await new Promise(resolve => setTimeout(resolve, 300));
            const doc = generatePDFReport(brandName, data);
            downloadPDF(doc, getFilename('pdf'));
        } catch (error) {
            console.error('PDF export failed:', error);
        } finally {
            setExportingPDF(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={exportingCSV || exportingPDF}
                className="border-gray-700 hover:bg-gray-800"
            >
                {exportingCSV ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={exportingCSV || exportingPDF}
                className="border-gray-700 hover:bg-gray-800"
            >
                {exportingPDF ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <FileText className="h-4 w-4 mr-2" />
                )}
                Export PDF
            </Button>
        </div>
    );
}
