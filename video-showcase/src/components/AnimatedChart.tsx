import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';

interface AnimatedChartProps {
    data: number[];
    width?: number;
    height?: number;
    barWidth?: number;
    delay?: number;
    style?: React.CSSProperties;
}

export const AnimatedChart: React.FC<AnimatedChartProps> = ({
    data,
    width = 600,
    height = 300,
    barWidth = 40,
    delay = 0,
    style,
}) => {
    const frame = useCurrentFrame();
    const adjustedFrame = frame - delay;
    const maxValue = Math.max(...data);
    const gap = (width - data.length * barWidth) / (data.length + 1);

    return (
        <div
            style={{
                width,
                height,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap,
                ...style,
            }}
        >
            {data.map((value, index) => {
                const barDelay = index * 5;
                const normalizedHeight = (value / maxValue) * (height - 20);
                const animatedHeight = interpolate(
                    adjustedFrame,
                    [barDelay, barDelay + 30],
                    [0, normalizedHeight],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                return (
                    <div
                        key={index}
                        style={{
                            width: barWidth,
                            height: animatedHeight,
                            backgroundColor: theme.colors.primary.DEFAULT,
                            borderRadius: '4px 4px 0 0',
                            boxShadow: `0 0 15px ${theme.colors.primary.DEFAULT}50`,
                        }}
                    />
                );
            })}
        </div>
    );
};
