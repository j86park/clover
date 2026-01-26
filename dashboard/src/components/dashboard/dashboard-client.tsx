'use client';

import * as React from 'react';
import { ASoVTrendChart } from '@/components/charts/asov-trend';
import { AuthorityHeatmap } from '@/components/charts/authority-heatmap';
import { CitationModal } from './citation-modal';
import { getSampleCitations } from '@/lib/metrics/citations';
import { Citation } from '@/types/analysis';

interface DashboardClientProps {
    collectionId: string;
    chartData: { date: string; asov: number }[];
    authorityData: { owned: number; earned: number; external: number };
}

export function DashboardClient({ collectionId, chartData, authorityData }: DashboardClientProps) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<{
        type: 'owned' | 'earned' | 'external';
        title: string;
    } | null>(null);
    const [citations, setCitations] = React.useState<Citation[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleCategoryClick = async (type: 'owned' | 'earned' | 'external') => {
        console.log('Category clicked:', type);
        const titleMap = {
            owned: 'Owned Citations',
            earned: 'Earned Citations',
            external: 'External Citations'
        };

        setSelectedCategory({ type, title: titleMap[type] });
        setIsModalOpen(true);
        setIsLoading(true);

        try {
            console.log('Fetching citations for:', type, 'in collection:', collectionId);
            const data = await getSampleCitations(collectionId, type);
            console.log('Fetched citations:', data.length);
            setCitations(data);
        } catch (error) {
            console.error('Failed to load citations:', error);
            setCitations([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                <ASoVTrendChart data={chartData.length > 0 ? chartData : undefined} />
                <AuthorityHeatmap
                    data={authorityData}
                    onCategoryClick={handleCategoryClick}
                />
            </div>

            <CitationModal
                isOpen={isModalOpen}
                onClose={() => {
                    console.log('Closing modal');
                    setIsModalOpen(false);
                }}
                title={selectedCategory?.title || ''}
                citations={citations}
                isLoading={isLoading}
            />
        </>
    );
}
