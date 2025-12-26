import { WidgetWrapper } from '../Common';

interface BonfireProps {
    gridSize?: { w: number; h: number };
}

export function Bonfire({ gridSize }: BonfireProps) {
    const w = gridSize?.w || 2;
    const h = gridSize?.h || 1;
    const minDim = Math.min(w, h);

    // Scale logic
    let scale = 0.85;
    if (minDim >= 3) scale = 1.7;
    else if (minDim >= 2) scale = 1.35;

    return (
        <WidgetWrapper className="bg-black border-none shadow-none p-0 overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center bg-black">
                <video
                    src="/videos/bonfire.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover pointer-events-none select-none"
                    style={{
                        width: `${200 * scale}px`,
                        height: `${200 * scale}px`,
                        filter: 'brightness(1.1) contrast(1.1)',
                        maskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)'
                    }}
                />
            </div>
        </WidgetWrapper>
    );
}