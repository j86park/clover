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

            {/* Dashboard Visualization (Literal Screenshot) */}
            <div
                style={{
                    position: 'absolute',
                    top: 140,
                    left: '50%',
                    transform: `translateX(-50%)`,
                    width: 1500,
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: `2px solid ${theme.colors.background.tertiary}`,
                    boxShadow: `0 30px 60px rgba(0,0,0,0.5)`,
                }}
            >
                <Img src={staticFile('screenshots/dashboard.png')} style={{ width: '100%' }} />

                {/* Floating Metric Indicators */}
                <div
                    style={{
                        position: 'absolute',
                        top: 400,
                        left: -50,
                        right: -50,
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0 40px',
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
