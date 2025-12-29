import { useState, useRef, useEffect } from 'react';
import { WidgetWrapper } from '../Common';

// --- 3. Snow Globe (스노우볼) ---
export const SnowGlobeConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 1], [2, 2]] as [number, number][],
};

// --- 3. Snow Globe (스노우볼) ---
export function SnowGlobe({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;
    const minDim = Math.min(w, h);

    // Scale logic
    let scale = 1;
    if (minDim === 1) scale = 0.5;
    else if (minDim >= 3) scale = 1.3;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isShaking, setIsShaking] = useState(false);
    const particles = useRef<{ x: number, y: number, r: number, d: number, speed: number }[]>([]);
    const requestRef = useRef<number>(0);

    // Initialize particles
    useEffect(() => {
        for (let i = 0; i < 60; i++) {
            particles.current.push({
                x: Math.random() * 200,
                y: Math.random() * 200,
                r: Math.random() * 2 + 1,
                d: Math.random() * 10,
                speed: Math.random() * 0.5 + 0.5
            });
        }
    }, []);

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw particles
        ctx.fillStyle = "white";
        ctx.beginPath();

        for (let i = 0; i < particles.current.length; i++) {
            const p = particles.current[i];
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);

            // Update position
            if (isShaking) {
                // Shake effect: move up randomly
                p.y -= Math.random() * 5;
                p.x += (Math.random() - 0.5) * 5;
            } else {
                // Gravity
                p.y += p.speed;
                p.x += Math.sin(p.d) * 0.5; // Sway
                p.d += 0.05;
            }

            // Boundary check
            if (p.y > canvas.height) {
                p.y = -5;
                p.x = Math.random() * canvas.width;
            }
            if (p.y < -10) {
                p.y = canvas.height;
            }
            if (p.x > canvas.width) {
                p.x = 0;
            }
            if (p.x < 0) {
                p.x = canvas.width;
            }
        }

        ctx.fill();
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isShaking]); // Re-bind when shake state changes

    const handleShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500); // Shake for 0.5s
    };

    return (
        <WidgetWrapper className="bg-transparent border-0 shadow-none overflow-visible">
            <div
                onClick={handleShake}
                className={`relative w-full h-full cursor-pointer transition-transform ${isShaking ? 'animate-shake' : ''}`}
                style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            >
                {/* Globe Glass */}
                <div className="w-full h-[85%] rounded-full bg-gradient-to-br from-blue-200/30 to-blue-400/10 border-4 border-white/50 backdrop-blur-[2px] relative overflow-hidden shadow-inner">
                    {/* Inner Scene (Snowman) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-6 h-6 bg-white rounded-full shadow-sm relative">
                            <div className="absolute top-2 left-1.5 w-0.5 h-0.5 bg-black rounded-full"></div>
                            <div className="absolute top-2 right-1.5 w-0.5 h-0.5 bg-black rounded-full"></div>
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-orange-500 rounded-full"></div>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-full -mt-2 shadow-sm flex items-center justify-center">
                            <div className="w-1 h-1 bg-gray-300 rounded-full mb-2"></div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full mt-2"></div>
                        </div>
                    </div>

                    {/* Canvas for Snow */}
                    <canvas
                        ref={canvasRef}
                        width={200}
                        height={200}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                    />

                    {/* Reflection Highlight */}
                    <div className="absolute top-4 left-4 w-6 h-4 bg-white/40 rounded-full transform -rotate-45 blur-sm"></div>
                </div>

                {/* Base */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[20%] bg-[#8d6e63] rounded-t-lg rounded-b-xl shadow-lg border-t-4 border-[#6d4c41]">
                    <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_12px)]"></div>
                </div>
            </div>
        </WidgetWrapper>
    );
}
