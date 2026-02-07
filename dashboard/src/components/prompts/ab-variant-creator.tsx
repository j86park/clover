'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Save, ArrowRight } from 'lucide-react';
import { generateABVariant, getVariationTypes, type VariationType } from '@/lib/prompts';

interface ABVariantCreatorProps {
    basePrompt: string;
    onVariantsCreated: (variantA: string, variantB: string) => void;
}

export function ABVariantCreator({ basePrompt, onVariantsCreated }: ABVariantCreatorProps) {
    const [variationType, setVariationType] = React.useState<VariationType>('tone');
    const [variantB, setVariantB] = React.useState<string>('');
    const variationTypes = getVariationTypes();

    const handleGenerateVariant = () => {
        const newVariant = generateABVariant(basePrompt, variationType);
        setVariantB(newVariant);
    };

    const handleSaveBoth = () => {
        if (variantB) {
            onVariantsCreated(basePrompt, variantB);
        }
    };

    React.useEffect(() => {
        // Auto-generate variant when type changes
        if (basePrompt) {
            handleGenerateVariant();
        }
    }, [variationType, basePrompt]);

    if (!basePrompt) {
        return (
            <Card className="border-dashed border-muted-foreground/30">
                <CardContent className="py-8 text-center text-muted-foreground">
                    <p>Create a prompt first to generate A/B variants</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    A/B Variant Creator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Variation Type Selector */}
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Variation Type</Label>
                    <div className="flex flex-wrap gap-2">
                        {variationTypes.map((type) => (
                            <Button
                                key={type.value}
                                variant={variationType === type.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setVariationType(type.value)}
                                className={variationType === type.value ? 'bg-purple-500 hover:bg-purple-600' : ''}
                            >
                                {type.label}
                            </Button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {variationTypes.find(t => t.value === variationType)?.description}
                    </p>
                </div>

                {/* Side-by-Side Preview */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Variant A (Original) */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                                Variant A
                            </Badge>
                            <span className="text-xs text-muted-foreground">Original</span>
                        </div>
                        <div className="p-3 rounded-md bg-muted/50 border text-sm min-h-[100px] font-mono">
                            {basePrompt}
                        </div>
                    </div>

                    {/* Variant B (Generated) */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                                Variant B
                            </Badge>
                            <span className="text-xs text-muted-foreground">Generated</span>
                        </div>
                        <div className="p-3 rounded-md bg-muted/50 border text-sm min-h-[100px] font-mono">
                            {variantB || 'Click "Regenerate" to create a variant'}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleGenerateVariant}
                        className="flex-1"
                    >
                        <Shuffle className="h-4 w-4 mr-2" />
                        Regenerate Variant
                    </Button>
                    <Button
                        onClick={handleSaveBoth}
                        disabled={!variantB}
                        className="flex-1 bg-purple-500 hover:bg-purple-600"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Both Variants
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
