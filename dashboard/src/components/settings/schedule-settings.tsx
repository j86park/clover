'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Loader2, Save, Trash2, CheckCircle2 } from 'lucide-react';
import type { CollectionSchedule } from '@/types';
import clsx from 'clsx';

export function ScheduleSettings() {
    const [schedules, setSchedules] = React.useState<CollectionSchedule[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

    // Form state
    const [scheduleType, setScheduleType] = React.useState<'daily' | 'weekly'>('daily');
    const [timeUtc, setTimeUtc] = React.useState('09:00');
    const [dayOfWeek, setDayOfWeek] = React.useState(1); // Monday

    React.useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/schedules');
            const data = await res.json();
            if (data.schedules && data.schedules.length > 0) {
                const schedule = data.schedules[0];
                setSchedules(data.schedules);
                setScheduleType(schedule.schedule_type === 'custom' ? 'daily' : schedule.schedule_type);
                setTimeUtc(schedule.time_utc);
                setDayOfWeek(schedule.day_of_week ?? 1);
            }
        } catch (err) {
            setError('Failed to load schedules');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await fetch('/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schedule_type: scheduleType,
                    time_utc: timeUtc,
                    day_of_week: scheduleType === 'weekly' ? dayOfWeek : null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save schedule');
            }

            setSuccessMessage('Schedule saved successfully');
            fetchSchedules();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save schedule');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to disable automated collections?')) return;

        try {
            const res = await fetch(`/api/schedules?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSchedules([]);
                setSuccessMessage('Automated collections disabled');
            }
        } catch (err) {
            setError('Failed to delete schedule');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const currentSchedule = schedules[0];

    return (
        <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-emerald-500" />
                        Automated Data Collection
                        {currentSchedule?.is_active && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                Active
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Configure when the system should automatically run data collections for your brand.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Schedule Form */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant={scheduleType === 'daily' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setScheduleType('daily')}
                                >
                                    Daily
                                </Button>
                                <Button
                                    variant={scheduleType === 'weekly' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setScheduleType('weekly')}
                                >
                                    Weekly
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="time">Run Time (UTC)</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                <Input
                                    id="time"
                                    type="time"
                                    value={timeUtc}
                                    onChange={(e) => setTimeUtc(e.target.value)}
                                    className="pl-10 bg-gray-950 border-gray-800"
                                />
                            </div>
                        </div>

                        {scheduleType === 'weekly' && (
                            <div className="space-y-2 md:col-span-2">
                                <Label>Day of Week</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                        <Button
                                            key={day}
                                            variant={dayOfWeek === i ? 'default' : 'outline'}
                                            size="sm"
                                            className="w-12"
                                            onClick={() => setDayOfWeek(i)}
                                        >
                                            {day}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-sm text-red-400">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-3 bg-emerald-900/20 border border-emerald-800 rounded-lg text-sm text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {successMessage}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        {currentSchedule && (
                            <Button
                                variant="outline"
                                className="text-red-400 border-red-900/50 hover:bg-red-900/20"
                                onClick={() => handleDelete(currentSchedule.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Disable Automation
                            </Button>
                        )}
                        <Button
                            className="ml-auto bg-emerald-600 hover:bg-emerald-500"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {currentSchedule ? 'Update Schedule' : 'Enable Automation'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {currentSchedule && (
                <Card className="bg-gray-900/30 border-gray-800 border-dashed">
                    <CardContent className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-white">Next Scheduled Run</p>
                                <p className="text-xs text-gray-400">
                                    {currentSchedule.next_run_at
                                        ? new Date(currentSchedule.next_run_at).toLocaleString()
                                        : 'Not scheduled'}
                                </p>
                            </div>
                        </div>
                        {currentSchedule.last_run_at && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Last Run</p>
                                <p className="text-sm text-gray-300">
                                    {new Date(currentSchedule.last_run_at).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
