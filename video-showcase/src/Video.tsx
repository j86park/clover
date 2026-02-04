import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { IntroScene } from './scenes/IntroScene';
import { ProblemScene } from './scenes/ProblemScene';
import { DataCollectionScene } from './scenes/DataCollectionScene';
import { AnalysisScene } from './scenes/AnalysisScene';
import { DashboardScene } from './scenes/DashboardScene';
import { TestingScene } from './scenes/TestingScene';
import { OutroScene } from './scenes/OutroScene';
import { theme } from './styles/theme';

export const CloverShowcase: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: theme.colors.background.primary }}>
            {/* Intro: 0-150 (5s) */}
            <Sequence from={0} durationInFrames={150}>
                <IntroScene />
            </Sequence>

            {/* Problem Statement: 150-450 (10s) */}
            <Sequence from={150} durationInFrames={300}>
                <ProblemScene />
            </Sequence>

            {/* Data Collection: 450-900 (15s) */}
            <Sequence from={450} durationInFrames={450}>
                <DataCollectionScene />
            </Sequence>

            {/* Analysis: 900-1350 (15s) */}
            <Sequence from={900} durationInFrames={450}>
                <AnalysisScene />
            </Sequence>

            {/* Dashboard: 1350-1950 (20s) */}
            <Sequence from={1350} durationInFrames={600}>
                <DashboardScene />
            </Sequence>

            {/* Testing: 1950-2400 (15s) */}
            <Sequence from={1950} durationInFrames={450}>
                <TestingScene />
            </Sequence>

            {/* Outro: 2400-2700 (10s) */}
            <Sequence from={2400} durationInFrames={300}>
                <OutroScene />
            </Sequence>
        </AbsoluteFill>
    );
};
