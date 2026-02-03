import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';

export const IntroScene: React.FC = () => {
    const frame = useCurrentFrame();

    // Logo fade in (0-60 frames)
    const logoOpacity = interpolate(frame, [0, 60], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Logo scale (0-60 frames)
    const logoScale = interpolate(frame, [0, 60], [0.8, 1], {
        extrapolateRight: 'clamp',
    });

    // Tagline fade in (90-150 frames)
    const taglineOpacity = interpolate(frame, [90, 130], [0, 1], {
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
            {/* Logo */}
            <div
                style={{
                    opacity: logoOpacity,
                    transform: `scale(${logoScale})`,
                    fontSize: 120,
                    fontFamily: theme.fonts.heading,
                    fontWeight: 700,
                    color: theme.colors.primary.DEFAULT,
                    textShadow: `0 0 40px ${theme.colors.primary.DEFAULT}`,
                    marginBottom: 32,
                }}
            >
                🍀 Clover
            </div>

            {/* Tagline */}
            <div
                style={{
                    opacity: taglineOpacity,
                    fontSize: 36,
                    fontFamily: theme.fonts.body,
                    color: theme.colors.text.secondary,
                }}
            >
                AI Visibility & Distribution
            </div>
        </AbsoluteFill>
    );
};
