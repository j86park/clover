import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';

const SAMPLE_TEXT = "When looking for the best project management software, many teams consider Notion for its flexibility, but Asana offers better task tracking. Monday.com is also popular among enterprises.";

const EXTRACTED_ENTITIES = [
    { name: 'Notion', sentiment: 'positive', position: 0 },
    { name: 'Asana', sentiment: 'positive', position: 1 },
    { name: 'Monday.com', sentiment: 'neutral', position: 2 },
];

export const AnalysisScene: React.FC = () => {
    const frame = useCurrentFrame();

    // Text reveal
    const textLength = SAMPLE_TEXT.length;
    const revealedChars = Math.floor(interpolate(frame, [0, 120], [0, textLength], {
        extrapolateRight: 'clamp',
    }));

    // Entity extraction animation
    const extractionProgress = interpolate(frame, [140, 300], [0, 1], {
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
                padding: 80,
            }}
        >
            {/* Title */}
            <div
                style={{
                    position: 'absolute',
                    top: 80,
                    fontSize: 48,
                    fontFamily: theme.fonts.heading,
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                }}
            >
                NER & Sentiment Analysis
            </div>

            {/* Sample text with highlighting */}
            <div
                style={{
                    fontSize: 32,
                    fontFamily: theme.fonts.body,
                    color: theme.colors.text.primary,
                    lineHeight: 1.8,
                    maxWidth: 1400,
                    textAlign: 'center',
                    marginBottom: 80,
                }}
            >
                {SAMPLE_TEXT.slice(0, revealedChars)}
                <span style={{ opacity: frame % 30 > 15 ? 1 : 0, color: theme.colors.primary.DEFAULT }}>|</span>
            </div>

            {/* Extracted entities */}
            <div
                style={{
                    display: 'flex',
                    gap: 40,
                    opacity: extractionProgress,
                    transform: `translateY(${20 - extractionProgress * 20}px)`,
                }}
            >
                {EXTRACTED_ENTITIES.map((entity, index) => {
                    const entityDelay = index * 0.2;
                    const entityOpacity = interpolate(
                        extractionProgress,
                        [entityDelay, entityDelay + 0.3],
                        [0, 1],
                        { extrapolateRight: 'clamp' }
                    );

                    const sentimentColor = {
                        positive: theme.colors.primary.DEFAULT,
                        negative: '#ef4444',
                        neutral: theme.colors.text.muted,
                    }[entity.sentiment];

                    return (
                        <div
                            key={entity.name}
                            style={{
                                opacity: entityOpacity,
                                backgroundColor: theme.colors.background.secondary,
                                padding: '24px 40px',
                                borderRadius: 16,
                                border: `2px solid ${sentimentColor}`,
                                boxShadow: `0 0 30px ${sentimentColor}30`,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 28,
                                    fontFamily: theme.fonts.heading,
                                    fontWeight: 600,
                                    color: theme.colors.text.primary,
                                    marginBottom: 8,
                                }}
                            >
                                {entity.name}
                            </div>
                            <div
                                style={{
                                    fontSize: 18,
                                    fontFamily: theme.fonts.body,
                                    color: sentimentColor,
                                    textTransform: 'capitalize',
                                }}
                            >
                                {entity.sentiment}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Subtitle */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 100,
                    fontSize: 28,
                    fontFamily: theme.fonts.body,
                    color: theme.colors.text.secondary,
                }}
            >
                LLM-powered brand extraction and context analysis
            </div>
        </AbsoluteFill>
    );
};
