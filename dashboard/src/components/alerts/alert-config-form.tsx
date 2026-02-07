'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Send, TrendingDown, Users, MessageSquare, AlertTriangle } from 'lucide-react';
import type { AlertConfig, AlertTriggers } from '@/types/alerts';

interface Brand {
    id: string;
    name: string;
}

interface AlertConfigFormProps {
    brands: Brand[];
    existingAlert?: AlertConfig;
    onSaved: () => void;
    onCancel: () => void;
}

export function AlertConfigForm({ brands, existingAlert, onSaved, onCancel }: AlertConfigFormProps) {
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [brandId, setBrandId] = useState(existingAlert?.brand_id || brands[0]?.id || '');
    const [destination, setDestination] = useState(existingAlert?.destination || '');
    const [triggers, setTriggers] = useState<AlertTriggers>(existingAlert?.triggers || {
        asov_drop_percent: 10,
        competitor_overtake: true,
        sentiment_negative: false,
        new_citation_source: false,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            const method = existingAlert ? 'PATCH' : 'POST';
            const body = existingAlert
                ? { id: existingAlert.id, destination, triggers }
                : { brand_id: brandId, destination, triggers };

            const res = await fetch('/api/alerts', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save alert');
            }

            onSaved();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSaving(false);
        }
    }

    async function handleTestEmail() {
        setTesting(true);
        setError(null);

        try {
            const res = await fetch('/api/alerts/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destination }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send test email');
            }

            alert('Test email sent! Check your inbox.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send test email');
        } finally {
            setTesting(false);
        }
    }

    function updateTrigger<K extends keyof AlertTriggers>(key: K, value: AlertTriggers[K]) {
        setTriggers(prev => ({ ...prev, [key]: value }));
    }

    return (
        <form onSubmit={handleSubmit}>
            <CardHeader className="border-b border-gray-800">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                        {existingAlert ? 'Edit Alert' : 'Create New Alert'}
                    </CardTitle>
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {error && (
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Brand Selection */}
                {!existingAlert && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Brand to Monitor
                        </label>
                        <select
                            value={brandId}
                            onChange={e => setBrandId(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                        >
                            {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Email Destination */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={destination}
                            onChange={e => setDestination(e.target.value)}
                            placeholder="alerts@yourcompany.com"
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleTestEmail}
                            disabled={!destination || testing}
                            className="border-gray-700"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {testing ? 'Sending...' : 'Test'}
                        </Button>
                    </div>
                </div>

                {/* Trigger Configuration */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Alert Triggers
                    </label>
                    <div className="space-y-4">
                        {/* ASoV Drop */}
                        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <TrendingDown className="h-5 w-5 text-orange-500" />
                                <div>
                                    <div className="text-sm font-medium text-white">ASoV Drop</div>
                                    <div className="text-xs text-gray-500">Alert when share of voice drops significantly</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={triggers.asov_drop_percent || ''}
                                    onChange={e => updateTrigger('asov_drop_percent', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="10"
                                    className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm"
                                />
                                <span className="text-gray-500 text-sm">%</span>
                            </div>
                        </div>

                        {/* Competitor Overtake */}
                        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-blue-500" />
                                <div>
                                    <div className="text-sm font-medium text-white">Competitor Overtake</div>
                                    <div className="text-xs text-gray-500">Alert when competitors surpass your visibility</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={triggers.competitor_overtake || false}
                                    onChange={e => updateTrigger('competitor_overtake', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* Sentiment Negative */}
                        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-red-500" />
                                <div>
                                    <div className="text-sm font-medium text-white">Sentiment Turns Negative</div>
                                    <div className="text-xs text-gray-500">Alert when brand sentiment becomes negative</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={triggers.sentiment_negative || false}
                                    onChange={e => updateTrigger('sentiment_negative', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* New Citation Source */}
                        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <div className="text-sm font-medium text-white">New Citation Sources</div>
                                    <div className="text-xs text-gray-500">Alert when significant new citations appear</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={triggers.new_citation_source || false}
                                    onChange={e => updateTrigger('new_citation_source', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="border-t border-gray-800 pt-4">
                <div className="flex justify-end gap-3 w-full">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving || !destination}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {saving ? 'Saving...' : (existingAlert ? 'Update Alert' : 'Create Alert')}
                    </Button>
                </div>
            </CardFooter>
        </form>
    );
}
