import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, random } from 'remotion';
import { theme } from '../styles/theme';
import { BrandLogo } from '../components/BrandLogo';
import { AnimatedText } from '../components/AnimatedText';
import { GlowEffect } from '../components/GlowEffect';

// Generate particles with deterministic positions
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
    x: random(`particle-x-${i}`) * 100,
    startY: 100 + random(`particle-y-${i}`) * 20,
    size: 4 + random(`particle-size-${i}`) * 8,
    speed: 0.3 + random(`particle-speed-${i}`) * 0.5,
    delay: random(`particle-delay-${i}`) * 60,
}));

export const IntroScene: React.FC = () => {
    const frame = useCurrentFrame();

    // Logo animation timing
    const logoProgress = interpolate(frame, [0, 60], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Tagline starts at frame 90
    const showTagline = frame >= 90;

    return (
        <AbsoluteFill
            style={{
                background: `radial-gradient(ellipse at center, ${theme.colors.background.secondary} 0%, ${theme.colors.background.primary} 70%)`,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Floating particles */}
            {PARTICLES.map((particle, i) => {
                const particleFrame = frame - particle.delay;
                const y = interpolate(
                    particleFrame,
                    [0, 150],
                    [particle.startY, particle.startY - 60],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );
                const opacity = interpolate(
                    particleFrame,
                    [0, 30, 120, 150],
                    [0, 0.6, 0.6, 0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${particle.x}%`,
                            top: `${y}%`,
                            width: particle.size,
                            height: particle.size,
                            borderRadius: '50%',
                            backgroundColor: theme.colors.primary.light,
                            opacity,
                            boxShadow: `0 0 ${particle.size * 2}px ${theme.colors.primary.DEFAULT}`,
                        }}
                    />
                );
            })}

            {/* Logo with glow */}
            <div style={{ opacity: logoProgress }}>
                <GlowEffect intensity={50} spread={30}>
                    <BrandLogo size={100} showText={true} />
                </GlowEffect>
            </div>

            {/* Tagline */}
            {showTagline && (
                <AnimatedText
                    text="AI Visibility & Distribution"
                    fontSize={36}
                    color={theme.colors.text.secondary}
                    effect="fade"
                    delay={0}
                    style={{ marginTop: 32 }}
                />
            )}
        </AbsoluteFill>
    );
};
