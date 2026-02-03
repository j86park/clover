import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../styles/theme';

const LLM_PROVIDERS = [
    { name: 'OpenAI', color: '#10a37f' },
    { name: 'Anthropic', color: '#d4a27f' },
    { name: 'Google', color: '#4285f4' },
    { name: 'Perplexity', color: '#20b2aa' },
];

export const DataCollectionScene: React.FC = () => {
    const frame = useCurrentFrame();

    // Center hub pulse
    const hubScale = interpolate(
        frame % 60,
        [0, 30, 60],
        [1, 1.05, 1],
        { extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill
            style={{
                backgroundColor: theme.colors.background.primary,
                justifyContent: 'center',
                alignItems: 'center',
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
                Multi-LLM Data Collection
            </div>

            {/* Network visualization */}
            <div style={{ position: 'relative', width: 800, height: 600 }}>
                {/* Center hub */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) scale(${hubScale})`,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        backgroundColor: theme.colors.primary.DEFAULT,
                        boxShadow: `0 0 60px ${theme.colors.primary.DEFAULT}`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: 48,
                    }}
                >
                    🍀
                </div>

                {/* LLM Provider nodes */}
                {LLM_PROVIDERS.map((provider, index) => {
                    const angle = (index * 90 - 45) * (Math.PI / 180);
                    const radius = 250;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    const nodeDelay = index * 20;
                    const nodeOpacity = interpolate(frame, [nodeDelay, nodeDelay + 30], [0, 1], {
                        extrapolateRight: 'clamp',
                    });

                    // Pulse animation for connection
                    const pulseProgress = ((frame - nodeDelay * 2) % 60) / 60;
                    const pulseOpacity = pulseProgress > 0 && pulseProgress < 1 ? 0.6 - pulseProgress * 0.6 : 0;

                    return (
                        <div key={provider.name}>
                            {/* Connection line */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    width: radius - 60,
                                    height: 3,
                                    backgroundColor: `${provider.color}40`,
                                    transform: `rotate(${angle}rad)`,
                                    transformOrigin: '0 50%',
                                    opacity: nodeOpacity,
                                }}
                            />

                            {/* Pulse effect */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `calc(50% + ${x * pulseProgress}px)`,
                                    top: `calc(50% + ${y * pulseProgress}px)`,
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    backgroundColor: provider.color,
                                    transform: 'translate(-50%, -50%)',
                                    opacity: pulseOpacity,
                                    boxShadow: `0 0 20px ${provider.color}`,
                                }}
                            />

                            {/* Provider node */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `calc(50% + ${x}px)`,
                                    top: `calc(50% + ${y}px)`,
                                    transform: 'translate(-50%, -50%)',
                                    opacity: nodeOpacity,
                                }}
                            >
                                <div
                                    style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        backgroundColor: theme.colors.background.secondary,
                                        border: `3px solid ${provider.color}`,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        boxShadow: `0 0 30px ${provider.color}40`,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 14,
                                            fontFamily: theme.fonts.body,
                                            fontWeight: 600,
                                            color: provider.color,
                                        }}
                                    >
                                        {provider.name}
                                    </span>
                                </div>
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
                Orchestrated collection via OpenRouter API
            </div>
        </AbsoluteFill>
    );
};
