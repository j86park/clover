import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Key, BarChart3, Building2, FileText, Bell } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your brand, API keys, prompts, alerts, and view usage statistics
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Link href="/settings/brand">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center space-y-0">
                            <Building2 className="h-5 w-5 mr-3 text-muted-foreground" />
                            <CardTitle className="text-lg">Brand Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Configure your brand details and tracking keywords
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/settings/prompts">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center space-y-0">
                            <FileText className="h-5 w-5 mr-3 text-emerald-500" />
                            <CardTitle className="text-lg">Prompt Library</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Browse and manage prompt templates for data collections
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/settings/alerts">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center space-y-0">
                            <Bell className="h-5 w-5 mr-3 text-emerald-500" />
                            <CardTitle className="text-lg">Email Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Get notified when visibility metrics change significantly
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/settings/api-keys">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center space-y-0">
                            <Key className="h-5 w-5 mr-3 text-muted-foreground" />
                            <CardTitle className="text-lg">API Keys</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Create and manage API keys for external integrations
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/settings/usage">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center space-y-0">
                            <BarChart3 className="h-5 w-5 mr-3 text-muted-foreground" />
                            <CardTitle className="text-lg">Usage & Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View API usage statistics and performance metrics
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}

