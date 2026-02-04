import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';

type AnimatedTextEffect = 'fade' | 'typewriter' | 'slide';

interface AnimatedTextProps {
    text: string;
    fontSize?: number;
    color?: string;
    delay?: number;
    effect?: AnimatedTextEffect;
    glow?: boolean;
    style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
    text,
    fontSize = 48,
    color = theme.colors.text.primary,
    delay = 0,
    effect = 'fade',
    glow = false,
    style,
}) => {
    const frame = useCurrentFrame();
    const adjustedFrame = frame - delay;

    let opacity = 1;
    let transform = 'none';
    let displayText = text;

    switch (effect) {
        case 'fade':
            opacity = interpolate(adjustedFrame, [0, 30], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
            });
            break;

        case 'typewriter':
            const charsToShow = Math.floor(
                interpolate(adjustedFrame, [0, text.length * 2], [0, text.length], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                })
            );
            displayText = text.slice(0, charsToShow);
            break;

        case 'slide':
            opacity = interpolate(adjustedFrame, [0, 20], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
            });
            const translateY = interpolate(adjustedFrame, [0, 20], [30, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
            });
            transform = `translateY(${translateY}px)`;
            break;
    }

    return (
        <div
            style={{
                opacity,
                transform,
                fontSize,
                fontFamily: theme.fonts.heading,
                color,
                textShadow: glow ? `0 0 30px ${theme.colors.primary.DEFAULT}` : 'none',
                ...style,
            }}
        >
            {displayText}
            {effect === 'typewriter' && adjustedFrame > 0 && (
                <span
                    style={{
                        opacity: adjustedFrame % 30 > 15 ? 1 : 0,
                        color: theme.colors.primary.DEFAULT,
                    }}
                >
                    |
                </span>
            )}
        </div>
    );
};
