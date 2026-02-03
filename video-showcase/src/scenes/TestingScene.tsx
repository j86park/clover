import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';

export const TestingScene: React.FC = () => {
    const frame = useCurrentFrame();

    // A/B split animation
    const splitProgress = interpolate(frame, [0, 60], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Results reveal
    const resultsOpacity = interpolate(frame, [180, 240], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Winner highlight
    const winnerGlow = interpolate(frame, [300, 330], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: theme.colors.background.primary,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
            }}
        >
            {/* Title */}
            <div
                style={{
                    position: 'absolute',
                    top: 80,
                    fontSize: 48,
                    fontFamily: theme.fonts.heading,
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                }}
            >
                A/B Content Testing Framework
            </div>

            {/* A/B Split visualization */}
            <div
                style={{
                    display: 'flex',
                    gap: 40,
                    marginBottom: 60,
                }}
            >
                {/* Variant A */}
                <div
                    style={{
                        width: 400,
                        padding: 40,
                        backgroundColor: theme.colors.background.secondary,
                        borderRadius: 20,
                        border: `2px solid ${theme.colors.background.tertiary}`,
                        transform: `translateX(${-100 + splitProgress * 100}px)`,
                        opacity: splitProgress,
                    }}
                >
                    <div
                        style={{
                            fontSize: 32,
                            fontFamily: theme.fonts.heading,
                            fontWeight: 600,
                            color: theme.colors.text.primary,
                            marginBottom: 16,
                        }}
                    >
                        Variant A
                    </div>
                    <div
                        style={{
                            fontSize: 18,
                            fontFamily: theme.fonts.body,
                            color: theme.colors.text.secondary,
                            marginBottom: 24,
                        }}
                    >
                        "Best project management tool"
                    </div>
                    <div
                        style={{
                            opacity: resultsOpacity,
                            fontSize: 48,
                            fontFamily: theme.fonts.heading,
                            fontWeight: 700,
                            color: theme.colors.text.muted,
                        }}
                    >
                        28%
                    </div>
                </div>

                {/* VS indicator */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 36,
                        fontFamily: theme.fonts.heading,
                        color: theme.colors.text.muted,
                        opacity: splitProgress,
                    }}
                >
                    VS
                </div>

                {/* Variant B - Winner */}
                <div
                    style={{
                        width: 400,
                        padding: 40,
                        backgroundColor: theme.colors.background.secondary,
                        borderRadius: 20,
                        border: `2px solid ${theme.colors.primary.DEFAULT}`,
                        transform: `translateX(${100 - splitProgress * 100}px)`,
                        opacity: splitProgress,
                        boxShadow: `0 0 ${winnerGlow * 60}px ${theme.colors.primary.DEFAULT}60`,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            fontSize: 32,
                            fontFamily: theme.fonts.heading,
                            fontWeight: 600,
                            color: theme.colors.text.primary,
                            marginBottom: 16,
                        }}
                    >
                        Variant B
                        {winnerGlow > 0.5 && (
                            <span
                                style={{
                                    fontSize: 16,
                                    backgroundColor: theme.colors.primary.DEFAULT,
                                    color: theme.colors.background.primary,
                                    padding: '4px 12px',
                                    borderRadius: 8,
                                }}
                            >
                                WINNER
                            </span>
                        )}
                    </div>
                    <div
                        style={{
                            fontSize: 18,
                            fontFamily: theme.fonts.body,
                            color: theme.colors.text.secondary,
                            marginBottom: 24,
                        }}
                    >
                        "Top-rated team collaboration software"
                    </div>
                    <div
                        style={{
                            opacity: resultsOpacity,
                            fontSize: 48,
                            fontFamily: theme.fonts.heading,
                            fontWeight: 700,
                            color: theme.colors.primary.DEFAULT,
                        }}
                    >
                        47%
                    </div>
                </div>
            </div>

            {/* Subtitle */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 100,
                    fontSize: 28,
                    fontFamily: theme.fonts.body,
                    color: theme.colors.text.secondary,
                    opacity: resultsOpacity,
                }}
            >
                Built-in ground truth validation & LLM-as-a-Judge scoring
            </div>
        </AbsoluteFill>
    );
};
