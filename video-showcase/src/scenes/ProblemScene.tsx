import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';

export const ProblemScene: React.FC = () => {
    const frame = useCurrentFrame();

    // Question text typewriter effect
    const questionChars = "How do LLMs talk about your brand?";
    const charsToShow = Math.floor(interpolate(frame, [0, 90], [0, questionChars.length], {
        extrapolateRight: 'clamp',
    }));

    // Answer fade in (200-300 frames)
    const answerOpacity = interpolate(frame, [200, 260], [0, 1], {
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
            }}
        >
            {/* Question */}
            <div
                style={{
                    fontSize: 64,
                    fontFamily: theme.fonts.heading,
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    textAlign: 'center',
                    maxWidth: 1200,
                    marginBottom: 60,
                }}
            >
                {questionChars.slice(0, charsToShow)}
                <span
                    style={{
                        opacity: frame % 30 > 15 ? 1 : 0,
                        color: theme.colors.primary.DEFAULT,
                    }}
                >
                    |
                </span>
            </div>

            {/* Answer */}
            <div
                style={{
                    opacity: answerOpacity,
                    fontSize: 48,
                    fontFamily: theme.fonts.body,
                    color: theme.colors.primary.DEFAULT,
                    textShadow: `0 0 30px ${theme.colors.primary.DEFAULT}40`,
                }}
            >
                Now you can find out.
            </div>
        </AbsoluteFill>
    );
};
