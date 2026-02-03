import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';

export const OutroScene: React.FC = () => {
    const frame = useCurrentFrame();

    // CTA text fade in
    const ctaOpacity = interpolate(frame, [0, 60], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Secondary text fade in
    const secondaryOpacity = interpolate(frame, [60, 120], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Logo fade in
    const logoOpacity = interpolate(frame, [120, 180], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Final glow pulse
    const glowIntensity = interpolate(
        frame,
        [240, 270, 300],
        [0, 1, 0.6],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill
            style={{
                background: `radial-gradient(ellipse at center, ${theme.colors.background.secondary} 0%, ${theme.colors.background.primary} 100%)`,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
            }}
        >
            {/* Main CTA */}
            <div
                style={{
                    opacity: ctaOpacity,
                    fontSize: 72,
                    fontFamily: theme.fonts.heading,
                    fontWeight: 700,
                    color: theme.colors.text.primary,
                    textAlign: 'center',
                    marginBottom: 24,
                }}
            >
                Optimize Your AI Presence
            </div>

            {/* Secondary text */}
            <div
                style={{
                    opacity: secondaryOpacity,
                    fontSize: 48,
                    fontFamily: theme.fonts.body,
                    color: theme.colors.primary.DEFAULT,
                    textShadow: `0 0 ${30 + glowIntensity * 30}px ${theme.colors.primary.DEFAULT}`,
                    marginBottom: 80,
                }}
            >
                with Clover
            </div>

            {/* Logo */}
            <div
                style={{
                    opacity: logoOpacity,
                    fontSize: 96,
                    textShadow: `0 0 ${40 + glowIntensity * 60}px ${theme.colors.primary.DEFAULT}`,
                }}
            >
                🍀
            </div>

            {/* Contact info */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 100,
                    opacity: logoOpacity,
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
