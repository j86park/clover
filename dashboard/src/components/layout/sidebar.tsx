'use client';

import * as React from 'react';
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
    const [user, setUser] = React.useState<{ email: string } | null>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const fetchUser = async () => {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                setUser({ email: data.user.email ?? 'User' });
            }
        };
        fetchUser();
    }, []);

    return (
        <aside className="h-screen w-64 border-r bg-background shrink-0 hidden md:flex md:flex-col">
            <div className="flex h-full flex-col w-full">
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

                {/* Footer / User Profile */}
                <div className="border-t p-4 space-y-3">
                    {mounted && (
                        <div className="px-3 py-2 bg-muted/50 rounded-lg animate-in fade-in duration-500">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Account</p>
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-sm font-bold truncate">
                                    {user?.email || 'Loading...'}
                                </span>
                                <button
                                    onClick={async () => {
                                        const { createClient } = await import('@/lib/supabase/client');
                                        const supabase = createClient();
                                        await supabase.auth.signOut();
                                        window.location.href = '/login';
                                    }}
                                    className="text-xs text-primary hover:text-primary/80 transition-colors text-left font-medium mt-1 w-fit"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="px-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                            v1.0.0 • Clover Analytics
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
