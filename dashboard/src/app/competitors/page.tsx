'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { WatchlistTable } from '@/components/watchlist/watchlist-table';
import { AddCompetitorModal } from '@/components/watchlist/add-competitor-modal';
import type { WatchlistEntry } from '@/types';

export default function CompetitorsPage() {
    const [entries, setEntries] = React.useState<WatchlistEntry[]>([]);
    const [categories, setCategories] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showModal, setShowModal] = React.useState(false);
    const [isAdding, setIsAdding] = React.useState(false);
    const [checkingIds, setCheckingIds] = React.useState<Set<string>>(new Set());
    const [isRefreshingAll, setIsRefreshingAll] = React.useState(false);

    // Load watchlist and categories on mount
    React.useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            // Load watchlist
            const res = await fetch('/api/watchlist');
            const data = await res.json();
            setEntries(data.entries || []);

            // Load brand keywords as categories
            const brandsRes = await fetch('/api/brands');
            const brandsData = await brandsRes.json();
            const allKeywords = brandsData.data?.flatMap((b: { keywords?: string[] }) => b.keywords || []) || [];
            setCategories([...new Set(allKeywords)] as string[]);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd(data: {
        competitor_name: string;
        competitor_domain?: string;
        category?: string;
    }) {
        setIsAdding(true);
        try {
            const res = await fetch('/api/watchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || 'Failed to add competitor');
            }

            // Add to list and trigger check
            const newEntry = result.entry as WatchlistEntry;
            setEntries((prev) => [newEntry, ...prev]);

            // Auto-trigger check for the new entry
            await handleCheck(newEntry.id);
        } finally {
            setIsAdding(false);
        }
    }

    async function handleCheck(entryId: string) {
        setCheckingIds((prev) => new Set([...prev, entryId]));
        try {
            const res = await fetch('/api/watchlist/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entryId }),
            });

            const result = await res.json();
            if (res.ok && result.entry) {
                setEntries((prev) =>
                    prev.map((e) => (e.id === entryId ? result.entry : e))
                );
            }
        } catch (error) {
            console.error('Check failed:', error);
        } finally {
            setCheckingIds((prev) => {
                const next = new Set(prev);
                next.delete(entryId);
                return next;
            });
        }
    }

    async function handleDelete(entryId: string) {
        if (!confirm('Remove this competitor from your watchlist?')) return;

        try {
            const res = await fetch(`/api/watchlist?id=${entryId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setEntries((prev) => prev.filter((e) => e.id !== entryId));
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    }

    async function handleRefreshAll() {
        setIsRefreshingAll(true);
        try {
            // Check all entries sequentially to avoid rate limits
            for (const entry of entries) {
                await handleCheck(entry.id);
            }
        } finally {
            setIsRefreshingAll(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Users className="h-8 w-8 text-emerald-500" />
                        Competitor Watchlist
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track competitor visibility independently with quick AI analysis.
                    </p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Competitor
                </Button>
            </div>

            {/* Watchlist Table */}
            <WatchlistTable
                entries={entries}
                onCheck={handleCheck}
                onDelete={handleDelete}
                onRefreshAll={handleRefreshAll}
                checkingIds={checkingIds}
                isRefreshingAll={isRefreshingAll}
            />

            {/* Add Competitor Modal */}
            <AddCompetitorModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onAdd={handleAdd}
                categories={categories}
                isAdding={isAdding}
            />
        </div>
    );
}
