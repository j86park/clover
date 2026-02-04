import React from 'react';
import { useCurrentFrame, interpolate, spring } from 'remotion';
import { theme } from '../styles/theme';

interface BrandLogoProps {
    size?: number;
    delay?: number;
    showText?: boolean;
    style?: React.CSSProperties;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
    size = 120,
    delay = 0,
    showText = true,
    style,
}) => {
    const frame = useCurrentFrame();
    const adjustedFrame = frame - delay;

    const opacity = interpolate(adjustedFrame, [0, 40], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const scale = spring({
        frame: adjustedFrame,
        fps: 30,
        config: { damping: 12, stiffness: 100 },
    });

    // Glow pulse effect
    const glowIntensity = interpolate(
        adjustedFrame % 60,
        [0, 30, 60],
        [30, 50, 30],
        { extrapolateRight: 'clamp' }
    );

    return (
        <div
            style={{
                opacity,
                transform: `scale(${scale})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                ...style,
            }}
        >
            <div
                style={{
                    fontSize: size,
                    textShadow: `0 0 ${glowIntensity}px ${theme.colors.primary.DEFAULT}`,
                }}
            >
                🍀
            </div>
            {showText && (
                <div
                    style={{
                        fontSize: size * 0.4,
                        fontFamily: theme.fonts.heading,
                        fontWeight: 700,
                        color: theme.colors.primary.DEFAULT,
                        marginTop: size * 0.1,
                    }}
                >
                    Clover
                </div>
            )}
        </div>
    );
};
