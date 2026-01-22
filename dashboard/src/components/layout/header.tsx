'use client';

import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex-1">
                {/* Breadcrumbs or page title can go here */}
            </div>

            {/* User placeholder */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                </Button>
            </div>
        </header>
    );
}
