import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile } from 'remotion';
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

            {/* Part 3: Results Visualization (Literal Screenshots) */}
            <div
                style={{
                    opacity: resultsOpacity,
                    position: 'absolute',
                    top: 140,
                    left: '50%',
                    transform: `translateX(-50%)`,
                    width: 1400,
                }}
            >
                {/* Phase A: Claude Analysis (250-300) */}
                <div style={{
                    opacity: interpolate(frame, [250, 270, 290, 310], [0, 1, 1, 0]),
                    position: 'absolute',
                    width: '100%',
                    borderRadius: 20,
                    overflow: 'hidden',
                    border: `2px solid ${theme.colors.background.tertiary}`,
                }}>
                    <Img src={staticFile('screenshots/analysis_claude.png')} style={{ width: '100%' }} />
                </div>

                {/* Phase B: GPT Analysis (310-360) */}
                <div style={{
                    opacity: interpolate(frame, [300, 320, 350, 370], [0, 1, 1, 0]),
                    position: 'absolute',
                    width: '100%',
                    borderRadius: 20,
                    overflow: 'hidden',
                    border: `2px solid ${theme.colors.background.tertiary}`,
                }}>
                    <Img src={staticFile('screenshots/analysis_gpt.png')} style={{ width: '100%' }} />
                </div>

                {/* Phase C: External Citations (360-450) */}
                <div style={{
                    opacity: interpolate(frame, [360, 380], [0, 1]),
                    position: 'absolute',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        width: 600,
                        borderRadius: 20,
                        overflow: 'hidden',
                        border: `2px solid ${theme.colors.background.tertiary}`,
                        boxShadow: `0 40px 80px rgba(0,0,0,0.6)`,
                    }}>
                        <Img src={staticFile('screenshots/external-citations.png')} style={{ width: '100%' }} />
                    </div>
                </div>

                {/* Floating Metrics on top */}
                <div
                    style={{
                        position: 'absolute',
                        top: 500,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        gap: 30,
                        justifyContent: 'center',
                        zIndex: 20,
                    }}
                >
                    <MetricCard
                        name="Mentions Found"
                        value={13}
                        delay={280}
                        style={{ minWidth: 200, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                    />
                    <MetricCard
                        name="Sentiment"
                        value={0.72}
                        unit="/ 1.0"
                        delay={300}
                        style={{ minWidth: 200, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                    />
                </div>
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
