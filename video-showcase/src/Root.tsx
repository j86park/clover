import { Composition } from 'remotion';
import { CloverShowcase } from './Video';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="CloverShowcase"
                component={CloverShowcase}
                durationInFrames={2700}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
