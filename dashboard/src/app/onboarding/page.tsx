import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
    return (
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">Welcome to LLM SEO Dashboard</CardTitle>
                <CardDescription className="text-lg mt-2">
                    Track your brand&apos;s visibility in AI-generated content
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Feature Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <h3 className="font-semibold">Answer Share of Voice</h3>
                        <p className="text-sm text-muted-foreground">
                            Track how often AI mentions your brand
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <div className="text-4xl mb-2">🎯</div>
                        <h3 className="font-semibold">AI Visibility Rate</h3>
                        <p className="text-sm text-muted-foreground">
                            Measure visibility across LLM responses
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <div className="text-4xl mb-2">🔗</div>
                        <h3 className="font-semibold">Citation Tracking</h3>
                        <p className="text-sm text-muted-foreground">
                            Monitor which sources AI recommends
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        Ready to see how AI perceives your brand?
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg" asChild>
                            <Link href="/brands">Set Up Your Brand</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/">Explore Dashboard</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
