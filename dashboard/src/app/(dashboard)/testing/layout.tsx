import { ReactNode } from 'react';

export default function TestingLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Testing & Validation</h1>
                    <p className="text-muted-foreground mt-2">
                        Verify dashboard data accuracy and monitor system health.
                    </p>
                </div>
            </div>
            {children}
        </div>
    );
}
