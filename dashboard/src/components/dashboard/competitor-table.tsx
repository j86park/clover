'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Metrics } from '@/types';

interface CompetitorTableProps {
    brandMetrics: Metrics & { brand_name?: string };
    competitorMetrics: (Metrics & { brand_name?: string })[];
}

export function CompetitorTable({ brandMetrics, competitorMetrics }: CompetitorTableProps) {
    const allBrands = [brandMetrics, ...competitorMetrics];

    // Find winners for each metric
    const asovWinner = allBrands.reduce((prev, current) =>
        current.asov > prev.asov ? current : prev
    );
    const aigvrWinner = allBrands.reduce((prev, current) =>
        current.aigvr > prev.aigvr ? current : prev
    );
    const sentimentWinner = allBrands.reduce((prev, current) =>
        current.sentiment_score > prev.sentiment_score ? current : prev
    );

    const totalAuthority = (m: Metrics) =>
        m.authority_owned + m.authority_earned + m.authority_external;
    const authorityWinner = allBrands.reduce((prev, current) =>
        totalAuthority(current) > totalAuthority(prev) ? current : prev
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Competitor Comparison</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Brand</TableHead>
                                <TableHead className="text-right">ASoV</TableHead>
                                <TableHead className="text-right">AIGVR</TableHead>
                                <TableHead className="text-right">Sentiment</TableHead>
                                <TableHead className="text-right">Authority</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allBrands.map((brand) => {
                                const isUserBrand = brand.brand_id === brandMetrics.brand_id;
                                const authority = totalAuthority(brand);

                                return (
                                    <TableRow
                                        key={brand.brand_id}
                                        className={isUserBrand ? 'bg-primary/5 font-medium' : ''}
                                    >
                                        <TableCell>
                                            {brand.brand_name || 'Unknown'}
                                            {isUserBrand && (
                                                <Badge variant="secondary" className="ml-2">
                                                    You
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {brand.asov.toFixed(1)}%
                                            {brand.brand_id === asovWinner.brand_id && (
                                                <Badge variant="success" className="ml-2">
                                                    🏆
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {brand.aigvr.toFixed(1)}%
                                            {brand.brand_id === aigvrWinner.brand_id && (
                                                <Badge variant="success" className="ml-2">
                                                    🏆
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {(brand.sentiment_score * 100).toFixed(0)}%
                                            {brand.brand_id === sentimentWinner.brand_id && (
                                                <Badge variant="success" className="ml-2">
                                                    🏆
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {authority}
                                            {brand.brand_id === authorityWinner.brand_id && (
                                                <Badge variant="success" className="ml-2">
                                                    🏆
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
