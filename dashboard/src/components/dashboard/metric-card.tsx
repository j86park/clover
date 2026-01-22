import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    label: string;
    value: string | number;
    trend?: number;
    icon: LucideIcon;
    variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function MetricCard({ label, value, trend, icon: Icon, variant = 'default' }: MetricCardProps) {
    const trendColor = trend && trend > 0 ? 'success' : trend && trend < 0 ? 'destructive' : 'secondary';
    const trendPrefix = trend && trend > 0 ? '+' : '';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend !== undefined && (
                    <Badge variant={trendColor} className="mt-2">
                        {trendPrefix}{trend}% from previous
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}
