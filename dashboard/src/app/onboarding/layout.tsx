import { ReactNode } from 'react';

export default function OnboardingLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
            <div className="max-w-2xl w-full">
                {children}
            </div>
        </div>
    );
}
