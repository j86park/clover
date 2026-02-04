import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';

interface NetworkNode {
    id: string;
    label: string;
    x: number;
    y: number;
    color?: string;
}

interface NetworkGraphProps {
    nodes: NetworkNode[];
    centerNode?: NetworkNode;
    width?: number;
    height?: number;
    delay?: number;
    style?: React.CSSProperties;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
    nodes,
    centerNode = { id: 'center', label: '🍀', x: 0.5, y: 0.5 },
    width = 600,
    height = 400,
    delay = 0,
    style,
}) => {
    const frame = useCurrentFrame();
    const adjustedFrame = frame - delay;

    const centerX = width * centerNode.x;
    const centerY = height * centerNode.y;

    // Center node pulse
    const centerScale = interpolate(
        adjustedFrame % 60,
        [0, 30, 60],
        [1, 1.05, 1],
        { extrapolateRight: 'clamp' }
    );

    return (
        <div style={{ width, height, position: 'relative', ...style }}>
            {/* Connection lines */}
            <svg
                width={width}
                height={height}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                {nodes.map((node, index) => {
                    const nodeX = width * node.x;
                    const nodeY = height * node.y;
                    const lineOpacity = interpolate(
                        adjustedFrame,
                        [index * 10, index * 10 + 20],
                        [0, 0.4],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                    return (
                        <line
                            key={`line-${node.id}`}
                            x1={centerX}
                            y1={centerY}
                            x2={nodeX}
                            y2={nodeY}
                            stroke={node.color || theme.colors.primary.DEFAULT}
                            strokeWidth={2}
                            opacity={lineOpacity}
                        />
                    );
                })}
            </svg>

            {/* Center node */}
            <div
                style={{
                    position: 'absolute',
                    left: centerX,
                    top: centerY,
                    transform: `translate(-50%, -50%) scale(${centerScale})`,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: theme.colors.primary.DEFAULT,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: 40,
                    boxShadow: `0 0 40px ${theme.colors.primary.DEFAULT}`,
                }}
            >
                {centerNode.label}
            </div>

            {/* Outer nodes */}
            {nodes.map((node, index) => {
                const nodeOpacity = interpolate(
                    adjustedFrame,
                    [index * 10, index * 10 + 20],
                    [0, 1],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                return (
                    <div
                        key={node.id}
                        style={{
                            position: 'absolute',
                            left: width * node.x,
                            top: height * node.y,
                            transform: 'translate(-50%, -50%)',
                            opacity: nodeOpacity,
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: theme.colors.background.secondary,
                            border: `2px solid ${node.color || theme.colors.primary.DEFAULT}`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 12,
                            fontFamily: theme.fonts.body,
                            fontWeight: 600,
                            color: node.color || theme.colors.primary.DEFAULT,
                            boxShadow: `0 0 20px ${node.color || theme.colors.primary.DEFAULT}30`,
                        }}
                    >
                        {node.label}
                    </div>
                );
            })}
        </div>
    );
};
