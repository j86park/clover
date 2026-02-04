import React from 'react';
import { useCurrentFrame, interpolate, spring } from 'remotion';
import { theme } from '../styles/theme';

interface MetricCardProps {
    name: string;
    value: number;
    unit?: string;
    change?: string;
    delay?: number;
    style?: React.CSSProperties;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    name,
    value,
    unit = '',
    change,
    delay = 0,
    style,
}) => {
    const frame = useCurrentFrame();
    const adjustedFrame = frame - delay;

    const scale = spring({
        frame: adjustedFrame,
        fps: 30,
        config: { damping: 15, stiffness: 100 },
    });

    const displayValue = interpolate(
        adjustedFrame,
        [10, 60],
        [0, value],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const isDecimal = value % 1 !== 0;

    return (
        <div
            style={{
                transform: `scale(${scale})`,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: 16,
                padding: '24px 32px',
                border: `1px solid ${theme.colors.background.tertiary}`,
                boxShadow: `0 0 30px ${theme.colors.primary.DEFAULT}15`,
                ...style,
            }}
        >
            <div
                style={{
                    fontSize: 16,
                    fontFamily: theme.fonts.body,
                    color: theme.colors.text.muted,
                    marginBottom: 8,
                }}
            >
                {name}
            </div>
            <div
                style={{
                    fontSize: 42,
                    fontFamily: theme.fonts.heading,
                    fontWeight: 700,
                    color: theme.colors.text.primary,
                }}
            >
                {displayValue.toFixed(isDecimal ? 1 : 0)}
                <span style={{ fontSize: 20, color: theme.colors.text.secondary }}>
                    {unit}
                </span>
            </div>
            {change && (
                <div
                    style={{
                        fontSize: 14,
                        fontFamily: theme.fonts.body,
                        color: theme.colors.primary.DEFAULT,
                        marginTop: 4,
                    }}
                >
                    {change}
                </div>
            )}
        </div>
    );
};
