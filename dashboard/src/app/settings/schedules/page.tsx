import { ScheduleSettings } from '@/components/settings/schedule-settings';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SchedulesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/settings">
                    <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Settings
                    </Button>
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Automated Collections</h1>
                <p className="text-muted-foreground">
                    Set up recurring data collections to monitor your brand's AI visibility automatically.
                </p>
            </div>

            <ScheduleSettings />
        </div>
    );
}
