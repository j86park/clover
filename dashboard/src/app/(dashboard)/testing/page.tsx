import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateValidationReport } from "@/lib/testing/reports";

export const dynamic = 'force-dynamic';

export default async function TestingPage() {
    const report = await generateValidationReport();
    const { summary, sections } = report;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.healthScore}%</div>
                        <p className="text-xs text-muted-foreground">Overall system confidence</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Test Runs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalTests}</div>
                        <p className="text-xs text-muted-foreground">Total tests executed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Passed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                        <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                            {report.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm">{rec}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Recent A/B Tests */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent A/B Tests</CardTitle>
                    <CardDescription>Performance experiments and content validation</CardDescription>
                </CardHeader>
                <CardContent>
                    {sections.abTests && sections.abTests.length > 0 ? (
                        <div className="space-y-4">
                            {sections.abTests.map((test: any) => (
                                <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <div className="font-semibold">{test.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Created: {new Date(test.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                                            {test.status}
                                        </Badge>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`/testing/ab/${test.id}`}>View Results</a>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No A/B tests found. Run a test via API to see results here.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Correlation Analysis Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Correlation Analysis</CardTitle>
                    <CardDescription>Brand mentions vs. external metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        Run a correlation test via API to populate this section.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
