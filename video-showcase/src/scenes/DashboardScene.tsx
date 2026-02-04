import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile } from 'remotion';
import { theme } from '../styles/theme';
import { MetricCard } from '../components/MetricCard';

export const DashboardScene: React.FC = () => {
    const frame = useCurrentFrame();

    return (
        <AbsoluteFill
            style={{
                backgroundColor: theme.colors.background.primary,
                padding: 80,
            }}
        >
            {/* Title */}
            <div
                style={{
                    fontSize: 48,
                    fontFamily: theme.fonts.heading,
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    marginBottom: 60,
                    textAlign: 'center',
                }}
            >
                Real-Time Metrics Dashboard
            </div>

            {/* Dashboard Visualizations (Multiple Screenshots) */}
            <div
                style={{
                    position: 'absolute',
                    top: 140,
                    left: '50%',
                    transform: `translateX(-50%)`,
                    width: 1500,
                    height: 700,
                }}
            >
                {/* Phase A: Main Dashboard (0-150) */}
                <div style={{
                    opacity: interpolate(frame, [0, 30, 140, 160], [0, 1, 1, 0]),
                    position: 'absolute',
                    width: '100%',
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: `2px solid ${theme.colors.background.tertiary}`,
                    boxShadow: `0 30px 60px rgba(0,0,0,0.5)`,
                }}>
                    <Img src={staticFile('screenshots/dashboard.png')} style={{ width: '100%' }} />
                </div>

                {/* Phase B: API Usage (150-300) */}
                <div style={{
                    opacity: interpolate(frame, [150, 170, 290, 310], [0, 1, 1, 0]),
                    position: 'absolute',
                    width: '100%',
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: `2px solid ${theme.colors.background.tertiary}`,
                    boxShadow: `0 30px 60px rgba(0,0,0,0.5)`,
                }}>
                    <Img src={staticFile('screenshots/api-usage.png')} style={{ width: '100%' }} />
                </div>

                {/* Phase C: API Keys (300-450) */}
                <div style={{
                    opacity: interpolate(frame, [300, 320], [0, 1]),
                    position: 'absolute',
                    width: '100%',
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: `2px solid ${theme.colors.background.tertiary}`,
                    boxShadow: `0 30px 60px rgba(0,0,0,0.5)`,
                }}>
                    <Img src={staticFile('screenshots/api-keys.png')} style={{ width: '100%' }} />
                </div>

                {/* Floating Metric Indicators */}
                <div
                    style={{
                        position: 'absolute',
                        top: 500,
                        left: -50,
                        right: -50,
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0 40px',
                        opacity: interpolate(frame, [0, 30, 140, 160], [0, 1, 1, 0]),
                    }}
                >
                    <MetricCard
                        name="Avg. Share of Voice"
                        value={33.1}
                        unit="%"
                        delay={60}
                        style={{ minWidth: 280, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                    />
                    <MetricCard
                        name="Visibility Rate"
                        value={90.5}
                        unit="%"
                        delay={80}
                        style={{ minWidth: 280, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                    />
                    <MetricCard
                        name="Sentiment"
                        value={70}
                        unit="%"
                        delay={100}
                        style={{ minWidth: 280, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                    />
                </div>
            </div>

            {/* Subtitle */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 60,
                    left: 0,
                    right: 0,
                    fontSize: 24,
                    fontFamily: theme.fonts.body,
                    color: theme.colors.text.secondary,
                    textAlign: 'center',
                }}
            >
                Answer Share of Voice • AI Visibility Rate • Competitor Analysis
            </div>
        </AbsoluteFill>
    );
};
