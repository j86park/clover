import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';
import { AnimatedText } from '../components/AnimatedText';
import { MetricCard } from '../components/MetricCard';

const SAMPLE_TEXT = "When looking for the best project management software, many teams consider Notion for its flexibility, but Asana offers better task tracking. Monday.com is also popular among enterprises for workflow automation.";

const EXTRACTED_ENTITIES = [
    { name: 'Notion', type: 'Brand', sentiment: 'positive', color: theme.colors.primary.DEFAULT },
    { name: 'Asana', type: 'Brand', sentiment: 'positive', color: '#f06a6a' },
    { name: 'Monday.com', type: 'Brand', sentiment: 'neutral', color: '#6c6cff' },
];

export const AnalysisScene: React.FC = () => {
    const frame = useCurrentFrame();

    // Part 1: Text reveal (frames 0-120)
    const textLength = SAMPLE_TEXT.length;
    const revealedChars = Math.floor(
        interpolate(frame, [0, 100], [0, textLength], {
            extrapolateRight: 'clamp',
        })
    );

    // Part 2: Entity extraction animation (frames 120-250)
    const extractionPhase = frame >= 120;
    const extractionProgress = interpolate(frame, [120, 200], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Part 3: Results visualization (frames 250-450)
    const resultsOpacity = interpolate(frame, [240, 280], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Text with highlighted entities
    const renderHighlightedText = () => {
        if (!extractionPhase) {
            return (
                <span>
                    {SAMPLE_TEXT.slice(0, revealedChars)}
                    <span style={{ opacity: frame % 30 > 15 ? 1 : 0, color: theme.colors.primary.DEFAULT }}>|</span>
                </span>
            );
        }

        // Highlight extracted entities
        let result = SAMPLE_TEXT;
        EXTRACTED_ENTITIES.forEach((entity) => {
            const highlightOpacity = interpolate(
                extractionProgress,
                [0, 0.5],
                [0, 1],
                { extrapolateRight: 'clamp' }
            );
            result = result.replace(
                entity.name,
                `<mark style="background: ${entity.color}40; color: ${entity.color}; padding: 2px 6px; border-radius: 4px; opacity: ${highlightOpacity}">${entity.name}</mark>`
            );
        });

        return <span dangerouslySetInnerHTML={{ __html: result }} />;
    };

    return (
        <AbsoluteFill
            style={{
                backgroundColor: theme.colors.background.primary,
                padding: 80,
                flexDirection: 'column',
            }}
        >
            {/* Title */}
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
                <AnimatedText
                    text="NER & Sentiment Analysis"
                    fontSize={48}
                    color={theme.colors.text.primary}
                    effect="fade"
                    glow
                />
            </div>

            {/* Sample text with extraction */}
            <div
                style={{
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: 16,
                    padding: 40,
                    marginBottom: 40,
                    maxWidth: 1400,
                    margin: '0 auto 40px',
                }}
            >
                <div
                    style={{
                        fontSize: 28,
                        fontFamily: theme.fonts.body,
                        color: theme.colors.text.primary,
                        lineHeight: 1.8,
                    }}
                >
                    {renderHighlightedText()}
                </div>
            </div>

            {/* Extracted entities cards */}
            <div
                style={{
                    display: 'flex',
                    gap: 30,
                    justifyContent: 'center',
                    marginBottom: 40,
                    opacity: resultsOpacity,
                }}
            >
                {EXTRACTED_ENTITIES.map((entity, index) => {
                    const cardDelay = index * 10;
                    const cardScale = interpolate(
                        frame,
                        [260 + cardDelay, 290 + cardDelay],
                        [0.8, 1],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                    return (
                        <div
                            key={entity.name}
                            style={{
                                transform: `scale(${cardScale})`,
                                backgroundColor: theme.colors.background.secondary,
                                padding: '24px 48px',
                                borderRadius: 16,
                                border: `2px solid ${entity.color}`,
                                boxShadow: `0 0 30px ${entity.color}30`,
                                textAlign: 'center',
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
                                    fontSize: 14,
                                    fontFamily: theme.fonts.body,
                                    color: theme.colors.text.muted,
                                    marginBottom: 4,
                                }}
                            >
                                {entity.type}
                            </div>
                            <div
                                style={{
                                    fontSize: 16,
                                    fontFamily: theme.fonts.body,
                                    color: entity.sentiment === 'positive' ? theme.colors.primary.DEFAULT : theme.colors.text.muted,
                                    textTransform: 'capitalize',
                                }}
                            >
                                {entity.sentiment}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Metrics row */}
            <div
                style={{
                    display: 'flex',
                    gap: 30,
                    justifyContent: 'center',
                    opacity: resultsOpacity,
                }}
            >
                <MetricCard
                    name="Entities Found"
                    value={3}
                    delay={280}
                    style={{ minWidth: 200 }}
                />
                <MetricCard
                    name="Avg. Sentiment"
                    value={0.72}
                    change="+0.08"
                    delay={290}
                    style={{ minWidth: 200 }}
                />
                <MetricCard
                    name="Topics Covered"
                    value={5}
                    delay={300}
                    style={{ minWidth: 200 }}
                />
            </div>

            {/* Subtitle */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 80,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                }}
            >
                <AnimatedText
                    text="LLM-powered brand extraction and context analysis"
                    fontSize={24}
                    color={theme.colors.text.secondary}
                    delay={300}
                    effect="fade"
                />
            </div>
        </AbsoluteFill>
    );
};
