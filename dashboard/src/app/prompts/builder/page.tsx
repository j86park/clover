'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WizardStep, WizardProgress } from '@/components/prompts/wizard-step';
import { PromptPreview } from '@/components/prompts/prompt-preview';
import { ABVariantCreator } from '@/components/prompts/ab-variant-creator';
import {
    buildPromptFromWizard,
    PROMPT_CATEGORIES,
    INTENT_TYPES,
    TONE_OPTIONS,
    OUTPUT_FORMATS,
    DEFAULT_BUILDER_STATE,
    type PromptBuilderState,
    type PromptCategory,
} from '@/lib/prompts';
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Save,
    Plus,
    X,
} from 'lucide-react';

const TOTAL_STEPS = 6;

export default function PromptBuilderPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = React.useState(1);
    const [state, setState] = React.useState<PromptBuilderState>(DEFAULT_BUILDER_STATE);
    const [newCompetitor, setNewCompetitor] = React.useState('');
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState(false);

    const generatedPrompt = React.useMemo(() => buildPromptFromWizard(state), [state]);

    const updateState = <K extends keyof PromptBuilderState>(
        key: K,
        value: PromptBuilderState[K]
    ) => {
        setState((prev) => ({ ...prev, [key]: value }));
    };

    const addCompetitor = () => {
        if (newCompetitor.trim() && !state.competitorNames.includes(newCompetitor.trim())) {
            updateState('competitorNames', [...state.competitorNames, newCompetitor.trim()]);
            setNewCompetitor('');
        }
    };

    const removeCompetitor = (name: string) => {
        updateState('competitorNames', state.competitorNames.filter((c) => c !== name));
    };

    const canProceed = (step: number): boolean => {
        switch (step) {
            case 1:
                return state.category !== null;
            case 2:
                return state.intent !== null;
            case 3:
                return true; // Optional step
            case 4:
                return true; // Has defaults
            case 5:
                return generatedPrompt.length > 0;
            case 6:
                return true; // Optional step
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (currentStep < TOTAL_STEPS && canProceed(currentStep)) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const isStepClickable = (step: number): boolean => {
        if (step <= currentStep) return true;

        // A step is clickable if all required steps before it are complete
        for (let i = 1; i < step; i++) {
            if (!canProceed(i)) return false;
        }
        return true;
    };

    const handleStepClick = (step: number) => {
        if (isStepClickable(step)) {
            setCurrentStep(step);
        }
    };

    const handleSavePrompt = async (prompts: string[]) => {
        setSaving(true);
        setError(null);

        try {
            for (const promptText of prompts) {
                const res = await fetch('/api/prompts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        category: state.category,
                        intent: state.intent || 'custom',
                        template: promptText,
                        isActive: true,
                    }),
                });

                if (!res.ok) {
                    throw new Error('Failed to save prompt');
                }
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/settings/prompts');
            }, 2000);
        } catch (err) {
            setError('Failed to save prompt. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleVariantsCreated = (variantA: string, variantB: string) => {
        handleSavePrompt([variantA, variantB]);
    };

    if (success) {
        return (
            <div className="space-y-6">
                <Alert className="border-green-500 bg-green-50 dark:bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-400">
                        Prompt(s) saved successfully! Redirecting to prompt library...
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Prompt Builder</h1>
                    <p className="text-muted-foreground">
                        Create effective prompts with our step-by-step wizard
                    </p>
                </div>
            </div>

            {/* Progress */}
            <WizardProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Wizard Steps (Left Column) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Step 1: Category */}
                    <WizardStep
                        step={1}
                        title="Select Category"
                        description="What type of prompt are you creating?"
                        isActive={currentStep === 1}
                        isComplete={currentStep > 1}
                        isClickable={isStepClickable(1)}
                        onClick={() => handleStepClick(1)}
                    >
                        <div className="grid sm:grid-cols-2 gap-3">
                            {PROMPT_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => updateState('category', cat.value)}
                                    className={`p-4 rounded-lg border text-left transition-all ${state.category === cat.value
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : 'border-border hover:border-emerald-500/50'
                                        }`}
                                >
                                    <p className="font-medium">{cat.label}</p>
                                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                                </button>
                            ))}
                        </div>
                    </WizardStep>

                    {/* Step 2: Intent */}
                    <WizardStep
                        step={2}
                        title="Choose Intent"
                        description="What do you want the prompt to accomplish?"
                        isActive={currentStep === 2}
                        isComplete={currentStep > 2}
                        isClickable={isStepClickable(2)}
                        onClick={() => handleStepClick(2)}
                    >
                        {state.category && (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {INTENT_TYPES[state.category].map((intent) => (
                                    <button
                                        key={intent.value}
                                        onClick={() => updateState('intent', intent.value)}
                                        className={`p-3 rounded-lg border text-left transition-all ${state.intent === intent.value
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-border hover:border-emerald-500/50'
                                            }`}
                                    >
                                        <p className="font-medium">{intent.label}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </WizardStep>

                    {/* Step 3: Brand/Competitors */}
                    <WizardStep
                        step={3}
                        title="Add Names (Optional)"
                        description="Add brand and competitor names to personalize"
                        isActive={currentStep === 3}
                        isComplete={currentStep > 3}
                        isClickable={isStepClickable(3)}
                        onClick={() => handleStepClick(3)}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="brandName">Your Brand Name</Label>
                                <Input
                                    id="brandName"
                                    placeholder="e.g., Acme Corp"
                                    value={state.brandName}
                                    onChange={(e) => updateState('brandName', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Competitor Names</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a competitor"
                                        value={newCompetitor}
                                        onChange={(e) => setNewCompetitor(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                                    />
                                    <Button onClick={addCompetitor} size="icon" variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {state.competitorNames.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {state.competitorNames.map((name) => (
                                            <span
                                                key={name}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                                            >
                                                {name}
                                                <button
                                                    onClick={() => removeCompetitor(name)}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </WizardStep>

                    {/* Step 4: Tone & Format */}
                    <WizardStep
                        step={4}
                        title="Configure Style"
                        description="Set the tone and output format"
                        isActive={currentStep === 4}
                        isComplete={currentStep > 4}
                        isClickable={isStepClickable(4)}
                        onClick={() => handleStepClick(4)}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tone</Label>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    {TONE_OPTIONS.map((tone) => (
                                        <button
                                            key={tone.value}
                                            onClick={() => updateState('tone', tone.value)}
                                            className={`p-3 rounded-lg border text-left transition-all ${state.tone === tone.value
                                                ? 'border-emerald-500 bg-emerald-500/10'
                                                : 'border-border hover:border-emerald-500/50'
                                                }`}
                                        >
                                            <p className="font-medium text-sm">{tone.label}</p>
                                            <p className="text-xs text-muted-foreground">{tone.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Output Format</Label>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    {OUTPUT_FORMATS.map((format) => (
                                        <button
                                            key={format.value}
                                            onClick={() => updateState('outputFormat', format.value)}
                                            className={`p-3 rounded-lg border text-left transition-all ${state.outputFormat === format.value
                                                ? 'border-emerald-500 bg-emerald-500/10'
                                                : 'border-border hover:border-emerald-500/50'
                                                }`}
                                        >
                                            <p className="font-medium text-sm">{format.label}</p>
                                            <p className="text-xs text-muted-foreground">{format.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customInstructions">Additional Instructions (Optional)</Label>
                                <Textarea
                                    id="customInstructions"
                                    placeholder="Any extra context or requirements..."
                                    value={state.customInstructions}
                                    onChange={(e) => updateState('customInstructions', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </WizardStep>

                    {/* Step 5: Preview */}
                    <WizardStep
                        step={5}
                        title="Preview & Refine"
                        description="Review your generated prompt"
                        isActive={currentStep === 5}
                        isComplete={currentStep > 5}
                        isClickable={isStepClickable(5)}
                        onClick={() => handleStepClick(5)}
                    >
                        <div className="space-y-4">
                            <PromptPreview
                                prompt={generatedPrompt}
                                variables={{
                                    brand: state.brandName || undefined,
                                    competitor: state.competitorNames[0] || undefined,
                                }}
                            />
                            <Button
                                onClick={() => handleSavePrompt([generatedPrompt])}
                                disabled={!generatedPrompt || saving}
                                className="w-full bg-emerald-500 hover:bg-emerald-600"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Prompt
                                    </>
                                )}
                            </Button>
                        </div>
                    </WizardStep>

                    {/* Step 6: A/B Variants */}
                    <WizardStep
                        step={6}
                        title="Create A/B Variants (Optional)"
                        description="Generate variations for testing"
                        isActive={currentStep === 6}
                        isComplete={false}
                        isClickable={isStepClickable(6)}
                        onClick={() => handleStepClick(6)}
                    >
                        <ABVariantCreator
                            basePrompt={generatedPrompt}
                            onVariantsCreated={handleVariantsCreated}
                        />
                    </WizardStep>
                </div>

                {/* Preview Panel (Right Column) */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle className="text-base">Live Preview</CardTitle>
                            <CardDescription>See your prompt as you build it</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PromptPreview
                                prompt={generatedPrompt}
                                variables={{
                                    brand: state.brandName || undefined,
                                    competitor: state.competitorNames[0] || undefined,
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={currentStep === TOTAL_STEPS || !canProceed(currentStep)}
                >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
