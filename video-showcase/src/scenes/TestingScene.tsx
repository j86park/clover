import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile } from 'remotion';
import { theme } from '../styles/theme';
import { AnimatedText } from '../components/AnimatedText';
import { GlowEffect } from '../components/GlowEffect';

export const TestingScene: React.FC = () => {
    const frame = useCurrentFrame();

    // Part 1: A/B Split (0-200)
    const splitProgress = interpolate(frame, [0, 60], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const resultsOpacity = interpolate(frame, [100, 150], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const winnerGlow = interpolate(frame, [150, 180], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Part 2: Transition (200-250)
    const transitionOpacity = interpolate(frame, [180, 220, 430, 450], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Ken Burns for screenshot
    const kenBurnsScale = interpolate(frame, [200, 450], [1, 1.05], {
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
                overflow: 'hidden',
            }}
        >
            {/* Title */}
            <div
                style={{
                    position: 'absolute',
                    top: 80,
                    zIndex: 20,
                }}
            >
                <AnimatedText
                    text="A/B Content Testing Framework"
                    fontSize={48}
                    color={theme.colors.text.primary}
                    effect="fade"
                    glow
                />
            </div>

            {/* Part 1: A/B Split Visualization */}
            <div
                style={{
                    display: 'flex',
                    gap: 40,
                    marginBottom: 60,
                    opacity: interpolate(frame, [180, 220], [1, 0]),
                }}
            >
                {/* Variant A */}
                <div
                    style={{
                        width: 450,
                        padding: 40,
                        backgroundColor: theme.colors.background.secondary,
                        borderRadius: 24,
                        border: `2px solid ${theme.colors.background.tertiary}`,
                        transform: `translateX(${-100 + splitProgress * 100}px)`,
                        opacity: splitProgress,
                    }}
                >
                    <div style={{ fontSize: 32, fontFamily: theme.fonts.heading, fontWeight: 600, color: theme.colors.text.primary, marginBottom: 16 }}>Variant A</div>
                    <div style={{ fontSize: 20, fontFamily: theme.fonts.body, color: theme.colors.text.secondary, marginBottom: 24, minHeight: 60 }}>"Best project management tool"</div>
                    <div style={{ opacity: resultsOpacity, fontSize: 64, fontFamily: theme.fonts.heading, fontWeight: 700, color: theme.colors.text.muted }}>28%</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', fontSize: 36, fontFamily: theme.fonts.heading, color: theme.colors.text.muted, opacity: splitProgress }}>VS</div>

                {/* Variant B - Winner */}
                <GlowEffect intensity={winnerGlow * 50} spread={30} color={theme.colors.primary.DEFAULT}>
                    <div
                        style={{
                            width: 450,
                            padding: 40,
                            backgroundColor: theme.colors.background.secondary,
                            borderRadius: 24,
                            border: `2px solid ${winnerGlow > 0.5 ? theme.colors.primary.DEFAULT : theme.colors.background.tertiary}`,
                            transform: `translateX(${100 - splitProgress * 100}px)`,
                            opacity: splitProgress,
                            position: 'relative',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontFamily: theme.fonts.heading, fontWeight: 600, color: theme.colors.text.primary, marginBottom: 16 }}>
                            Variant B
                            {winnerGlow > 0.8 && (
                                <span style={{ fontSize: 16, backgroundColor: theme.colors.primary.DEFAULT, color: theme.colors.background.primary, padding: '4px 12px', borderRadius: 8 }}>WINNER</span>
                            )}
                        </div>
                        <div style={{ fontSize: 20, fontFamily: theme.fonts.body, color: theme.colors.text.secondary, marginBottom: 24, minHeight: 60 }}>"Top-rated team collaboration software"</div>
                        <div style={{ opacity: resultsOpacity, fontSize: 64, fontFamily: theme.fonts.heading, fontWeight: 700, color: theme.colors.primary.DEFAULT }}>47%</div>
                    </div>
                </GlowEffect>
            </div>

            {/* Part 2: Literal Screenshot (Collection Details) */}
            <div
                style={{
                    opacity: transitionOpacity,
                    position: 'absolute',
                    top: 180,
                    width: 1500,
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: `2px solid ${theme.colors.background.tertiary}`,
                    boxShadow: `0 30px 60px rgba(0,0,0,0.5)`,
                    transform: `scale(${kenBurnsScale})`,
                }}
            >
                <Img src={staticFile('screenshots/data-collection.png')} style={{ width: '100%' }} />
            </div>

            {/* Subtitle */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 100,
                    zIndex: 20,
                }}
            >
                <AnimatedText
                    text="Built-in ground truth validation & LLM-as-a-Judge scoring"
                    fontSize={28}
                    color={theme.colors.text.secondary}
                    delay={100}
                    effect="fade"
                />
            </div>
        </AbsoluteFill>
    );
};

    );
};
