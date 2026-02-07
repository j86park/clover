'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface WizardStepProps {
    step: number;
    title: string;
    description?: string;
    isActive: boolean;
    isComplete: boolean;
    children: React.ReactNode;
}

export function WizardStep({
    step,
    title,
    description,
    isActive,
    isComplete,
    children,
}: WizardStepProps) {
    return (
        <div className={cn(
            'border rounded-lg transition-all duration-200',
            isActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-border',
            isComplete && !isActive ? 'border-emerald-500/50 bg-muted/30' : ''
        )}>
            {/* Step Header */}
            <div className={cn(
                'flex items-center gap-4 p-4 cursor-pointer',
                !isActive && 'opacity-75'
            )}>
                {/* Step Number / Check */}
                <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors',
                    isComplete
                        ? 'bg-emerald-500 text-white'
                        : isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-muted text-muted-foreground'
                )}>
                    {isComplete ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        step
                    )}
                </div>

                {/* Title and Description */}
                <div className="flex-1">
                    <h3 className={cn(
                        'font-medium',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                        {title}
                    </h3>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {/* Collapsible Content */}
            {isActive && (
                <div className="px-4 pb-4 pt-2 border-t border-border/50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

interface WizardProgressProps {
    currentStep: number;
    totalSteps: number;
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
    const progress = ((currentStep) / totalSteps) * 100;

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Step {currentStep} of {totalSteps}</span>
                <span className="font-medium text-emerald-500">{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
