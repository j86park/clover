'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Plus, Trash2, Mail, AlertTriangle, TrendingDown, Users, MessageSquare } from 'lucide-react';
import { AlertConfigForm } from '@/components/alerts/alert-config-form';
import type { AlertConfig, AlertTriggers } from '@/types/alerts';

interface Brand {
    id: string;
    name: string;
}

export default function AlertsSettingsPage() {
    const [alerts, setAlerts] = useState<AlertConfig[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAlert, setEditingAlert] = useState<AlertConfig | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            // Load alerts
            const alertsRes = await fetch('/api/alerts');
            const alertsData = await alertsRes.json();
            setAlerts(alertsData.alerts || []);

            // Load brands for the form
            const brandsRes = await fetch('/api/brands');
            const brandsData = await brandsRes.json();
            setBrands(brandsData.data || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(alertId: string) {
        if (!confirm('Are you sure you want to delete this alert?')) return;

        try {
            const res = await fetch(`/api/alerts?id=${alertId}`, { method: 'DELETE' });
            if (res.ok) {
                setAlerts(alerts.filter(a => a.id !== alertId));
            }
        } catch (error) {
            console.error('Failed to delete alert:', error);
        }
    }

    async function handleToggle(alert: AlertConfig) {
        try {
            const res = await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: alert.id, is_active: !alert.is_active }),
            });
            if (res.ok) {
                setAlerts(alerts.map(a =>
                    a.id === alert.id ? { ...a, is_active: !a.is_active } : a
                ));
            }
        } catch (error) {
            console.error('Failed to toggle alert:', error);
        }
    }

    function handleSaved() {
        setShowForm(false);
        setEditingAlert(null);
        loadData();
    }

    function getTriggerIcons(triggers: AlertTriggers) {
        const icons = [];
        if (triggers.asov_drop_percent) icons.push(<TrendingDown key="asov" className="h-4 w-4" />);
        if (triggers.competitor_overtake) icons.push(<Users key="comp" className="h-4 w-4" />);
        if (triggers.sentiment_negative) icons.push(<MessageSquare key="sent" className="h-4 w-4" />);
        if (triggers.new_citation_source) icons.push(<AlertTriangle key="cite" className="h-4 w-4" />);
        return icons;
    }

    function getBrandName(brandId: string) {
        return brands.find(b => b.id === brandId)?.name || 'Unknown Brand';
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="h-8 w-8 text-emerald-500" />
                        Email Alerts
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Get notified when your brand's visibility metrics change significantly.
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Alert
                </Button>
            </div>

            {/* Form Modal */}
            {(showForm || editingAlert) && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <AlertConfigForm
                            brands={brands}
                            existingAlert={editingAlert || undefined}
                            onSaved={handleSaved}
                            onCancel={() => { setShowForm(false); setEditingAlert(null); }}
                        />
                    </div>
                </div>
            )}

            {/* Alert List */}
            {alerts.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="py-12 text-center">
                        <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300 mb-2">No alerts configured</h3>
                        <p className="text-gray-500 mb-4">
                            Create your first alert to get notified of important metric changes.
                        </p>
                        <Button
                            onClick={() => setShowForm(true)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Alert
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {alerts.map(alert => (
                        <Card
                            key={alert.id}
                            className={`bg-gray-900/50 border-gray-800 transition-opacity ${!alert.is_active ? 'opacity-50' : ''
                                }`}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${alert.is_active ? 'bg-emerald-500/20' : 'bg-gray-700'
                                            }`}>
                                            <Mail className={`h-5 w-5 ${alert.is_active ? 'text-emerald-500' : 'text-gray-500'
                                                }`} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">
                                                {getBrandName(alert.brand_id)}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {alert.destination}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Trigger Icons */}
                                        <div className="flex items-center gap-2 text-gray-500">
                                            {getTriggerIcons(alert.triggers)}
                                        </div>

                                        {/* Last Triggered */}
                                        {alert.last_triggered_at && (
                                            <div className="text-xs text-gray-500">
                                                Last: {new Date(alert.last_triggered_at).toLocaleDateString()}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggle(alert)}
                                                className={alert.is_active ? 'text-emerald-500' : 'text-gray-500'}
                                            >
                                                {alert.is_active ? 'Active' : 'Paused'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingAlert(alert)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(alert.id)}
                                                className="text-red-500 hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Info Banner */}
            <Card className="mt-8 bg-emerald-900/20 border-emerald-800/50">
                <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-300">
                            <strong>How it works:</strong> Alerts are evaluated automatically after each data collection.
                            When a configured threshold is met, you'll receive an email with details about the change.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
