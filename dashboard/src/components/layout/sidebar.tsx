'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Database,
    BarChart3,
    Settings,
} from 'lucide-react';

const navItems = [
    {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        title: 'Collections',
        href: '/collections',
        icon: Database,
    },
    {
        title: 'Analysis',
        href: '/analysis',
        icon: BarChart3,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform md:translate-x-0">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center border-b px-6">
                    <h1 className="text-xl font-bold">LLM SEO Dashboard</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t p-4">
                    <p className="text-xs text-muted-foreground">
                        v1.0.0 • Clover Analytics
                    </p>
                </div>
            </div>
        </aside>
    );
}
