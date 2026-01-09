import { useState, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { useWidgetStorage } from '../SDK';

export function LadderGame({ gridSize: _ }: { gridSize?: { w: number; h: number } }) {
    const [players, setPlayers] = useWidgetStorage<string[]>('widget-ladder-players', ['A', 'B', 'C', 'D']);
    const [results] = useWidgetStorage<string[]>('widget-ladder-results', ['꽝', '당첨', '꽝', '통과']);
    const [isPlaying, setIsPlaying] = useState(false);
    const [paths, setPaths] = useState<any[]>([]); // Store generated ladder paths
    const [currentPathIndex, setCurrentPathIndex] = useState(-1);
    const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateLadder = () => {
        // Generate horizontal lines
        const steps = 8; // Number of vertical sections
        const playerCount = players.length;

        // Randomly place bridges
        // Data structure: map of (col, row) -> boolean (has right bridge)
        // Ensure no adjacent bridges on same row
        const bridges: boolean[][] = Array(playerCount - 1).fill(null).map(() => Array(steps).fill(false));

        for (let r = 0; r < steps; r++) {
            for (let c = 0; c < playerCount - 1; c++) {
                // Random 30% chance, and check left neighbor
                if (Math.random() < 0.4) {
                    // Check left neighbor (c-1, r)
                    if (c > 0 && bridges[c - 1][r]) continue;
                    bridges[c][r] = true;
                }
            }
        }
        setPaths(bridges);
    };

    useEffect(() => {
        generateLadder();
    }, [players.length]); // Regenerate when player count changes

    // Draw the ladder
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Dynamic Sizing: Match canvas resolution to display size
        const updateSize = () => {
            const rect = canvas.getBoundingClientRect();
            // Only update if dimensions differ to avoid clear loop (though we redraw anyway)
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                canvas.width = rect.width;
                canvas.height = rect.height;
            }
        };

        // Initial set
        updateSize();

        // Observer for responsiveness
        const resizeObserver = new ResizeObserver(() => {
            updateSize();
            // Force re-render/redraw by triggering a state if needed, 
            // but here simply calling the draw logic might be needed if it wasn't in a separate effect.
            // Since our draw logic is in a useEffect depending on players/paths, we might need to trigger it.
            // Actually, manipulating canvas.width autoclears it, so we MUST redraw.
            // We can do this by moving draw logic into a function called here, or adding a 'resize' dependency.
            // For simplicity, let's keep it simple: Changing width/height clears context.
            // So we need to ensure the draw effect runs AFTER size update.
            // Let's combine sizing and drawing in the same Effect, or use a size state.
        });
        resizeObserver.observe(canvas);

        return () => resizeObserver.disconnect();
    }, []); // Run once to set up observer logic? No, this is tricky with the separate draw effect.

    // Better approach: Use a size state that triggers redraw
    const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const observer = new ResizeObserver(() => {
            const rect = canvas.getBoundingClientRect();
            setCanvasSize({ w: rect.width, h: rect.height });
            canvas.width = rect.width;
            canvas.height = rect.height;
        });
        observer.observe(canvas);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || canvasSize.w === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const playerCount = players.length;
        // ... drawing logic continues ...
        const colWidth = width / playerCount;
        const paddingX = colWidth / 2;
        const rowHeight = (height - 40) / 8; // 8 steps

        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw Vertical Lines
        ctx.beginPath();
        ctx.strokeStyle = '#e5e7eb'; // Gray-200
        ctx.lineWidth = 4;
        for (let i = 0; i < playerCount; i++) {
            const x = paddingX + i * colWidth;
            ctx.moveTo(x, 20);
            ctx.lineTo(x, height - 20);
        }
        ctx.stroke();

        // Draw Horizontal Bridges
        ctx.beginPath();
        ctx.strokeStyle = '#e5e7eb';
        for (let c = 0; c < playerCount - 1; c++) {
            for (let r = 0; r < 8; r++) {
                if (paths[c] && paths[c][r]) {
                    const x1 = paddingX + c * colWidth;
                    const x2 = paddingX + (c + 1) * colWidth;
                    const y = 20 + (r + 0.5) * rowHeight;
                    ctx.moveTo(x1, y);
                    ctx.lineTo(x2, y);
                }
            }
        }
        ctx.stroke();

        // Draw Active Path if playing or finished
        if (selectedPlayer !== null) {
            drawPath(ctx, colWidth, paddingX, rowHeight);
        }

    }, [players, paths, selectedPlayer, currentPathIndex, canvasSize]);

    const animatePath = (startIndex: number) => {
        if (isPlaying) return;
        setIsPlaying(true);
        setSelectedPlayer(startIndex);

        // Animation logic:
        // We will increment 'step' count to animate logic
        // But for canvas, we might just draw full path progressively?
        // Or simply calculate the destination instantly but draw slowly?
        // Let's go simple. Calculate path trace.

        // Trace logic:
        // Current (col, y)
        // Iterate rows. At each mid-row check bridge.
        // If bridge right -> go right
        // If bridge left -> go left

        let col = startIndex;
        const trace: { x: number, y: number }[] = [];
        const playerCount = players.length;
        const colWidth = canvasRef.current!.width / playerCount;
        const paddingX = colWidth / 2;
        const rowHeight = (canvasRef.current!.height - 40) / 8;

        trace.push({ x: paddingX + col * colWidth, y: 20 });

        for (let r = 0; r < 8; r++) {
            const yMid = 20 + (r + 0.5) * rowHeight;
            const yEnd = 20 + (r + 1) * rowHeight;

            // Move down to bridge level
            trace.push({ x: paddingX + col * colWidth, y: yMid });

            // Check bridges
            if (col < playerCount - 1 && paths[col][r]) {
                // Right
                col++;
                trace.push({ x: paddingX + col * colWidth, y: yMid });
            } else if (col > 0 && paths[col - 1][r]) {
                // Left
                col--;
                trace.push({ x: paddingX + col * colWidth, y: yMid });
            }

            // Move down to end of row
            trace.push({ x: paddingX + col * colWidth, y: yEnd });
        }

        // Trace is an array of points.
        // We want to animate drawing lines between these points.

        let pointIdx = 0;
        const totalPoints = trace.length;

        const interval = setInterval(() => {
            pointIdx++;
            setCurrentPathIndex(pointIdx);

            if (pointIdx >= totalPoints) {
                clearInterval(interval);
                setIsPlaying(false);
            }
        }, 100); // Speed
    };

    const drawPath = (ctx: CanvasRenderingContext2D, colW: number, padX: number, rowH: number) => {
        let col = selectedPlayer!;
        const trace: { x: number, y: number }[] = [];
        const playerCount = players.length;

        trace.push({ x: padX + col * colW, y: 20 });

        for (let r = 0; r < 8; r++) {
            const yMid = 20 + (r + 0.5) * rowH;
            const yEnd = 20 + (r + 1) * rowH;

            trace.push({ x: padX + col * colW, y: yMid });

            if (col < playerCount - 1 && paths[col][r]) {
                trace.push({ x: padX + (col + 0.5) * colW, y: yMid }); // Midpoint for smoothness
                col++;
            } else if (col > 0 && paths[col - 1][r]) {
                trace.push({ x: padX + (col - 0.5) * colW, y: yMid }); // Midpoint
                col--;
            }

            trace.push({ x: padX + col * colW, y: yMid });
            trace.push({ x: padX + col * colW, y: yEnd });
        }

        // Draw trace
        ctx.beginPath();
        ctx.strokeStyle = '#EF4444'; // Red-500
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
        ctx.shadowBlur = 10;

        if (trace.length > 0) {
            ctx.moveTo(trace[0].x, trace[0].y);
            const limit = isPlaying ? Math.min(trace.length, currentPathIndex) : trace.length;

            for (let i = 1; i < limit; i++) {
                ctx.lineTo(trace[i].x, trace[i].y);
            }
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
    };

    return (
        <div className="h-full flex flex-col p-4 theme-bg-card rounded-xl shadow-sm border theme-border overflow-hidden">
            {/* Top Players */}
            <div className="flex justify-around mb-2">
                {players.map((p, i) => (
                    <button
                        key={i}
                        onClick={() => animatePath(i)}
                        disabled={isPlaying}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                            ${selectedPlayer === i ? 'bg-red-500 text-white scale-110 shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                         `}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {/* Canvas Ladder */}
            <div className="flex-1 relative min-h-0 bg-white/50 rounded-lg border border-dashed border-gray-200">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block"
                />
            </div>

            {/* Bottom Results */}
            <div className="flex justify-around mt-2">
                {results.map((r, i) => (
                    <div key={i} className="text-xs font-bold theme-text-primary text-center w-8 truncate">
                        {r}
                    </div>
                ))}
            </div>

            {/* New Game / Settings */}
            <div className="mt-4 flex justify-center border-t theme-border pt-4">
                <button
                    onClick={() => {
                        setPaths([]); // Clear -> triggers regenerate
                        setSelectedPlayer(null);
                        setPlayers(['A', 'B', 'C', 'D']); // Reset to default for now or shuffle
                        // Ideally input field for players/results
                    }}
                    className="flex items-center gap-2 text-xs font-bold theme-text-secondary hover:text-[var(--btn-bg)]"
                >
                    <RotateCcw size={14} /> New Game
                </button>
            </div>
        </div>
    );
}
