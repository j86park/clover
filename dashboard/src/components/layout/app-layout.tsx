'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import * as React from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (isAuthPage) {
        return <main className="h-screen w-screen overflow-hidden bg-background">{children}</main>;
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:pl-64">
                <Header />
                <main className="flex-1 overflow-y-auto bg-background p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
