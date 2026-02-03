import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { theme } from '../styles/theme';

const METRICS = [
    { name: 'ASoV', value: 34.2, unit: '%', change: '+5.2%' },
    { name: 'AIGVR', value: 78, unit: '%', change: '+12%' },
    { name: 'Sentiment', value: 0.72, unit: '', change: '+0.08' },
    { name: 'Competitors', value: 12, unit: '', change: '3 new' },
];

export const DashboardScene: React.FC = () => {
    const frame = useCurrentFrame();

    return (
        <AbsoluteFill
            style={{
                backgroundColor: theme.colors.background.primary,
                padding: 80,
            }}
        >
            {/* Title */}
            <div
                style={{
                    fontSize: 48,
                    fontFamily: theme.fonts.heading,
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    marginBottom: 60,
                    textAlign: 'center',
                }}
            >
                Real-Time Metrics Dashboard
            </div>

            {/* Metrics grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 40,
                    width: '100%',
                    maxWidth: 1600,
                    margin: '0 auto 60px',
                }}
            >
                {METRICS.map((metric, index) => {
                    const delay = index * 8;
                    const cardScale = spring({
                        frame: frame - delay,
                        fps: 30,
                        config: { damping: 15, stiffness: 100 },
                    });

                    const countTo = metric.value;
                    const displayValue = interpolate(
                        frame,
                        [delay + 20, delay + 80],
                        [0, countTo],
                        { extrapolateRight: 'clamp' }
                    );

                    return (
                        <div
                            key={metric.name}
                            style={{
                                transform: `scale(${cardScale})`,
                                backgroundColor: theme.colors.background.secondary,
                                borderRadius: 20,
                                padding: 40,
                                border: `1px solid ${theme.colors.background.tertiary}`,
                                boxShadow: `0 0 40px ${theme.colors.primary.DEFAULT}10`,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 20,
                                    fontFamily: theme.fonts.body,
                                    color: theme.colors.text.muted,
                                    marginBottom: 12,
                                }}
                            >
                                {metric.name}
                            </div>
                            <div
                                style={{
                                    fontSize: 56,
                                    fontFamily: theme.fonts.heading,
                                    fontWeight: 700,
                                    color: theme.colors.text.primary,
                                }}
                            >
                                {displayValue.toFixed(metric.value % 1 === 0 ? 0 : 1)}
                                <span style={{ fontSize: 28, color: theme.colors.text.secondary }}>
                                    {metric.unit}
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: 18,
                                    fontFamily: theme.fonts.body,
                                    color: theme.colors.primary.DEFAULT,
                                    marginTop: 8,
                                }}
                            >
                                {metric.change}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Animated chart placeholder */}
            <div
                style={{
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: 20,
                    padding: 40,
                    width: '100%',
                    maxWidth: 1600,
                    margin: '0 auto',
                    height: 350,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-around',
                    border: `1px solid ${theme.colors.background.tertiary}`,
                }}
            >
                {[0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 0.75, 0.85, 0.6, 0.95, 0.8, 0.7].map((height, index) => {
                    const barDelay = 60 + index * 5;
                    const barHeight = interpolate(
                        frame,
                        [barDelay, barDelay + 40],
                        [0, height * 280],
                        { extrapolateRight: 'clamp' }
                    );

                    return (
                        <div
                            key={index}
                            style={{
                                width: 60,
                                height: barHeight,
                                backgroundColor: theme.colors.primary.DEFAULT,
                                borderRadius: '8px 8px 0 0',
                                boxShadow: `0 0 20px ${theme.colors.primary.DEFAULT}40`,
                            }}
                        />
                    );
                })}
            </div>

            {/* Subtitle */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 60,
                    left: 0,
                    right: 0,
                    fontSize: 24,
                    fontFamily: theme.fonts.body,
                    color: theme.colors.text.secondary,
                    textAlign: 'center',
                }}
            >
                Answer Share of Voice • AI Visibility Rate • Competitor Analysis
            </div>
        </AbsoluteFill>
    );
};
