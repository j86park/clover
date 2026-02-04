import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';

interface GlowEffectProps {
    children: React.ReactNode;
    intensity?: number;
    spread?: number;
    color?: string;
    pulse?: boolean;
    style?: React.CSSProperties;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
    children,
    intensity = 40,
    spread = 20,
    color = theme.colors.primary.DEFAULT,
    pulse = true,
    style,
}) => {
    const frame = useCurrentFrame();

    const currentIntensity = pulse
        ? interpolate(frame % 60, [0, 30, 60], [intensity * 0.7, intensity, intensity * 0.7])
        : intensity;

    return (
        <div
            style={{
                filter: `drop-shadow(0 0 ${spread}px ${color}) drop-shadow(0 0 ${currentIntensity}px ${color})`,
                ...style,
            }}
        >
            {children}
        </div>
    );
};
