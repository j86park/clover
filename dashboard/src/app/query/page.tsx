'use client';

import * as React from 'react';
import { QueryInterface } from '@/components/query/query-interface';

export default function QueryPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">AI Data Explorer</h1>
                <p className="text-muted-foreground">
                    Ask questions about your SEO performance and brand visibility in natural language.
                </p>
            </div>

            <QueryInterface />
        </div>
    );
}
