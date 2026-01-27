'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import * as React from 'react';

const Sidebar = dynamic(() => import('./sidebar').then(mod => mod.Sidebar), { ssr: false });

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (isAuthPage) {
        return <main className="h-screen w-screen overflow-hidden bg-background">{children}</main>;
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            {/* Sidebar container - reserves space even during dynamic load */}
            <div className="hidden md:block w-64 shrink-0">
                <Sidebar />
            </div>
            <div className="flex flex-1 flex-col min-h-screen min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
