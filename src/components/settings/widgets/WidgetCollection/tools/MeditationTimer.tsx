import { useState, useEffect } from 'react';
import { Play, Square, Settings, Wind } from 'lucide-react';
import { WidgetWrapper } from '../Common';

interface MeditationTimerProps {
    gridSize?: { w: number; h: number };
}

export function MeditationTimer({ gridSize }: MeditationTimerProps) {
    const [timeLeft, setTimeLeft] = useState(60); // Seconds
    const [isActive, setIsActive] = useState(false);
    const [duration, setDuration] = useState(60); // 1 min default
    const [showSettings, setShowSettings] = useState(false);
    const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

    // Responsive
    const w = gridSize?.w || 2;
    const isSmall = w === 1;

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            setPhase('Inhale');
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Breathing Cycle Logic (4-4-4 Box Breathing or similar)
    useEffect(() => {
        if (!isActive) return;

        const cycleLength = 12000; // 4s In, 4s Hold, 4s Out
        const startTime = Date.now();

        const breathInterval = setInterval(() => {
            const elapsed = (Date.now() - startTime) % cycleLength;
            if (elapsed < 4000) setPhase('Inhale');
            else if (elapsed < 8000) setPhase('Hold');
            else setPhase('Exhale');
        }, 100);

        return () => clearInterval(breathInterval);
    }, [isActive]);

    const toggleTimer = () => {
        setIsActive(!isActive);
        setShowSettings(false);
    };

    const resetTimer = (newDuration: number) => {
        setDuration(newDuration);
        setTimeLeft(newDuration);
        setIsActive(false);
        setShowSettings(false);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // --- Small View ---
    if (isSmall) {
        return (
            <WidgetWrapper className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900 group">
                <div className="flex flex-col items-center justify-center h-full relative">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        {/* Simple Pulse Animation */}
                        <div className={`absolute inset-0 bg-emerald-400 rounded-full opacity-20 ${isActive ? 'animate-ping' : ''}`} />
                        <button
                            onClick={toggleTimer}
                            className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isActive ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-emerald-900 text-emerald-500 shadow-sm'}`}
                        >
                            {isActive ? <Square size={14} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                        </button>
                    </div>
                    <div className="mt-2 text-center">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatTime(timeLeft)}</span>
                    </div>

                    {!isActive && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100">
                            <button onClick={() => resetTimer(60)} className="text-[8px] px-1 bg-white rounded border">R</button>
                        </div>
                    )}
                </div>
            </WidgetWrapper>
        );
    }

    // --- Medium/Large View ---
    return (
        <WidgetWrapper className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
            {/* Background Animation Circle */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl transition-all duration-[4000ms] ${isActive && phase === 'Inhale' ? 'scale-150 opacity-30' : (isActive && phase === 'Exhale' ? 'scale-50 opacity-10' : 'scale-100 opacity-20')}`} />

            <div className="p-4 h-full flex flex-col items-center justify-between relative z-10">
                <div className="w-full flex justify-between items-start">
                    <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Wind size={12} /> Breath
                    </h3>
                    <button onClick={() => setShowSettings(!showSettings)} className="text-emerald-400 hover:text-emerald-600">
                        <Settings size={12} />
                    </button>
                </div>

                {/* Main Display */}
                <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold font-mono text-slate-700 dark:text-slate-200 tabular-nums">
                        {formatTime(timeLeft)}
                    </div>
                    <div className={`text-xs font-medium mt-1 transition-colors duration-500 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {isActive ? phase.toUpperCase() : 'READY'}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                    <button
                        onClick={toggleTimer}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${isActive
                            ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 px-6'}`}
                    >
                        {isActive ? 'STOP' : 'START'}
                    </button>
                </div>

                {/* Settings Overlay */}
                {showSettings && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20 animate-in fade-in">
                        <p className="text-xs font-bold text-slate-500 mb-1">Set Duration</p>
                        <div className="flex gap-2">
                            {[1, 3, 5].map(min => (
                                <button
                                    key={min}
                                    onClick={() => resetTimer(min * 60)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${duration === min * 60 ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {min}m
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
