import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';
import { BrandLogo } from '../components/BrandLogo';
import { AnimatedText } from '../components/AnimatedText';
import { GlowEffect } from '../components/GlowEffect';

export const OutroScene: React.FC = () => {
    const frame = useCurrentFrame();

    // Background gradient animation
    const gradientShift = interpolate(frame, [0, 300], [0, 20], {
        extrapolateRight: 'clamp',
    });

    // CTA text (frames 0-60)
    const ctaOpacity = interpolate(frame, [0, 60], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // "with Clover" (frames 60-120)
    const showSecondary = frame >= 60;

    // Logo (frames 120-180)
    const showLogo = frame >= 120;
    const logoOpacity = interpolate(frame, [120, 180], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Contact info (frames 180-240)
    const contactOpacity = interpolate(frame, [180, 240], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Final glow pulse (frames 240-300)
    const finalGlow = interpolate(frame, [240, 270, 300], [40, 80, 60], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill
            style={{
                background: `radial-gradient(ellipse at ${50 + gradientShift}% ${50 - gradientShift / 2}%, ${theme.colors.background.secondary} 0%, ${theme.colors.background.primary} 100%)`,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
            }}
        >
            {/* Main CTA */}
            <div style={{ opacity: ctaOpacity }}>
                <AnimatedText
                    text="Optimize Your AI Presence"
                    fontSize={72}
                    color={theme.colors.text.primary}
                    effect="fade"
                    style={{ fontWeight: 700, textAlign: 'center' }}
                />
            </div>

            {/* Secondary text */}
            {showSecondary && (
                <GlowEffect intensity={30} color={theme.colors.primary.DEFAULT}>
                    <AnimatedText
                        text="with Clover"
                        fontSize={48}
                        color={theme.colors.primary.DEFAULT}
                        effect="typewriter"
                        style={{ marginTop: 16 }}
                    />
                </GlowEffect>
            )}

            {/* Logo */}
            {showLogo && (
                <div
                    style={{
                        opacity: logoOpacity,
                        marginTop: 60,
                        filter: `drop-shadow(0 0 ${finalGlow}px ${theme.colors.primary.DEFAULT})`,
                    }}
                >
                    <BrandLogo size={80} showText={false} />
                </div>
            )}

            {/* Contact info */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 100,
                    opacity: contactOpacity,
                    fontSize: 24,
                    fontFamily: theme.fonts.body,
                    color: theme.colors.text.secondary,
                }}
            >
                cloverlabs.ai
            </div>
        </AbsoluteFill>
    );
};
