import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile } from 'remotion';
import { theme } from '../styles/theme';
import { NetworkGraph } from '../components/NetworkGraph';
import { AnimatedText } from '../components/AnimatedText';

const LLM_NODES = [
    { id: 'openai', label: 'GPT-4', x: 0.2, y: 0.25, color: '#10a37f' },
    { id: 'anthropic', label: 'Claude', x: 0.8, y: 0.25, color: '#d4a27f' },
    { id: 'google', label: 'Gemini', x: 0.2, y: 0.75, color: '#4285f4' },
    { id: 'perplexity', label: 'Perplexity', x: 0.8, y: 0.75, color: '#20b2aa' },
];

export const DataCollectionScene: React.FC = () => {
    const frame = useCurrentFrame();

    // Part 1: Stylized network (frames 0-200)
    const networkOpacity = interpolate(frame, [0, 30, 180, 220], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Part 2: Transition (frames 200-250)
    const transitionProgress = interpolate(frame, [200, 250], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Part 3: Dashboard visualization (frames 250-450)
    const dashboardOpacity = interpolate(frame, [230, 280], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Ken Burns effect for dashboard view
    const kenBurnsScale = interpolate(frame, [250, 450], [1, 1.1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const kenBurnsPan = interpolate(frame, [250, 450], [0, -30], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: theme.colors.background.primary,
                overflow: 'hidden',
            }}
        >
            {/* Title */}
            <div
                style={{
                    position: 'absolute',
                    top: 60,
                    width: '100%',
                    textAlign: 'center',
                    zIndex: 10,
                }}
            >
                <AnimatedText
                    text="Multi-LLM Data Collection"
                    fontSize={48}
                    color={theme.colors.text.primary}
                    effect="fade"
                    glow
                />
            </div>

            {/* Part 1: Stylized Network Graph */}
            <div
                style={{
                    opacity: networkOpacity,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <NetworkGraph
                    nodes={LLM_NODES}
                    width={800}
                    height={500}
                />
            </div>

            {/* Part 3: Dashboard Visualization (stylized since no screenshot) */}
            <div
                style={{
                    opacity: dashboardOpacity,
                    position: 'absolute',
                    top: 140,
                    left: '50%',
                    transform: `translateX(-50%) scale(${kenBurnsScale}) translateY(${kenBurnsPan}px)`,
                }}
            >
                {/* Stylized dashboard representation */}
                <div
                    style={{
                        width: 1400,
                        height: 700,
                        backgroundColor: theme.colors.background.secondary,
                        borderRadius: 20,
                        border: `2px solid ${theme.colors.background.tertiary}`,
                        padding: 40,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 24,
                    }}
                >
                    {/* Header row */}
                    <div style={{ display: 'flex', gap: 20 }}>
                        {LLM_NODES.map((node, i) => {
                            const cardDelay = i * 15;
                            const cardOpacity = interpolate(
                                frame,
                                [280 + cardDelay, 310 + cardDelay],
                                [0, 1],
                                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                            );
                            return (
                                <div
                                    key={node.id}
                                    style={{
                                        opacity: cardOpacity,
                                        flex: 1,
                                        backgroundColor: theme.colors.background.tertiary,
                                        borderRadius: 12,
                                        padding: 20,
                                        border: `2px solid ${node.color}`,
                                        textAlign: 'center',
                                    }}
                                >
                                    <div style={{
                                        fontSize: 24,
                                        fontFamily: theme.fonts.heading,
                                        color: node.color,
                                        fontWeight: 600,
                                    }}>
                                        {node.label}
                                    </div>
                                    <div style={{
                                        fontSize: 14,
                                        fontFamily: theme.fonts.body,
                                        color: theme.colors.text.muted,
                                        marginTop: 8,
                                    }}>
                                        Connected ✓
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress visualization */}
                    <div
                        style={{
                            flex: 1,
                            backgroundColor: theme.colors.background.primary,
                            borderRadius: 12,
                            padding: 30,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{
                            fontSize: 28,
                            fontFamily: theme.fonts.body,
                            color: theme.colors.text.secondary,
                            marginBottom: 20,
                        }}>
                            Collecting responses from all providers...
                        </div>
                        <div
                            style={{
                                width: '80%',
                                height: 16,
                                backgroundColor: theme.colors.background.tertiary,
                                borderRadius: 8,
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    width: `${interpolate(frame, [300, 420], [0, 100], { extrapolateRight: 'clamp' })}%`,
                                    height: '100%',
                                    backgroundColor: theme.colors.primary.DEFAULT,
                                    boxShadow: `0 0 20px ${theme.colors.primary.DEFAULT}`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtitle */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 80,
                    width: '100%',
                    textAlign: 'center',
                }}
            >
                <AnimatedText
                    text="Orchestrated via OpenRouter API"
                    fontSize={24}
                    color={theme.colors.text.secondary}
                    delay={60}
                    effect="fade"
                />
            </div>
        </AbsoluteFill>
    );
};
