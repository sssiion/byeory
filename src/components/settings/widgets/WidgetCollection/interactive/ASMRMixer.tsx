import { useState } from 'react';
import { CloudRain, Flame, Wind, Coffee, Play, Pause, Headphones, Moon, Sun } from 'lucide-react';
import { WidgetWrapper } from '../Common';

const SOUNDS = [
    { id: 'rain', icon: CloudRain, label: '빗소리', color: 'text-blue-400' },
    { id: 'fire', icon: Flame, label: '장작불', color: 'text-orange-500' },
    { id: 'wind', icon: Wind, label: '바람', color: 'text-slate-400' },
    { id: 'cafe', icon: Coffee, label: '카페', color: 'text-amber-700' },
];

const PRESETS = [
    { name: 'Focus', icon: Sun, levels: { rain: 20, fire: 0, wind: 0, cafe: 60 } },
    { name: 'Sleep', icon: Moon, levels: { rain: 60, fire: 30, wind: 10, cafe: 0 } },
    { name: 'Cozy', icon: Flame, levels: { rain: 20, fire: 80, wind: 0, cafe: 0 } },
];

interface ASMRMixerProps {
    gridSize?: { w: number; h: number };
}

export const ASMRMixerConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 1], [2, 2], [3, 2], [4, 2]] as [number, number][],
};

export function ASMRMixer({ gridSize }: ASMRMixerProps) {
    const [volumes, setVolumes] = useState<Record<string, number>>({
        rain: 50, fire: 0, wind: 0, cafe: 0,
    });
    const [isPlaying, setIsPlaying] = useState(false);

    // Responsive Logic
    const w = gridSize?.w || 2;
    // const h = gridSize?.h || 1;
    const isSmall = w === 1;
    const isLarge = w >= 3;

    const handleVolumeChange = (id: string, value: number) => {
        setVolumes(prev => ({ ...prev, [id]: value }));
        if (value > 0 && !isPlaying) setIsPlaying(true);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    const applyPreset = (levels: Record<string, number>) => {
        setVolumes(levels);
        setIsPlaying(true);
    };

    // --- Small View (1x1) ---
    if (isSmall) {
        return (
            <WidgetWrapper className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                <div className="flex flex-col items-center justify-center h-full gap-2 cursor-pointer" onClick={togglePlay}>
                    <div className={`p-3 rounded-full transition-all duration-500 ${isPlaying ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-slate-400'}`}>
                        {isPlaying ? <Headphones size={24} className="animate-pulse" /> : <Play size={24} className="ml-1" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{isPlaying ? 'ON AIR' : 'ASMR'}</span>
                </div>
            </WidgetWrapper>
        );
    }

    // --- Medium & Large Views ---
    return (
        <WidgetWrapper className="bg-card dark:bg-custom-gray">
            <div className="h-full flex flex-col p-3">
                {/* Header */}
                <div className="flex justify-between items-center mb-3 flex-shrink-0">
                    <h3 className="text-xs font-bold flex items-center gap-2 theme-text-primary">
                        <span className={`w-2 h-2 rounded-full transition-colors ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                        ASMR Mixer
                    </h3>
                    <div className="flex gap-2">
                        {isLarge && PRESETS.map(preset => (
                            <button
                                key={preset.name}
                                onClick={() => applyPreset(preset.levels)}
                                className="p-1 px-2 rounded-md bg-black/5 hover:bg-black/10 text-[9px] font-bold theme-text-secondary transition-colors"
                            >
                                {preset.name}
                            </button>
                        ))}
                        <button
                            onClick={togglePlay}
                            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors theme-text-primary bg-black/5"
                        >
                            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                    </div>
                </div>

                {/* Sliders */}
                <div className={`flex-1 overflow-y-auto pr-1 custom-scrollbar ${isLarge ? 'grid grid-cols-2 gap-x-4 gap-y-2' : 'space-y-3'}`}>
                    {SOUNDS.map(sound => (
                        <div key={sound.id} className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/5 ${volumes[sound.id] > 0 ? sound.color : 'text-gray-400'}`}>
                                <sound.icon size={14} />
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                {!isLarge && (
                                    <div className="flex justify-between text-[10px] theme-text-secondary font-medium">
                                        <span>{sound.label}</span>
                                        <span>{volumes[sound.id]}%</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={volumes[sound.id]}
                                        onChange={(e) => handleVolumeChange(sound.id, parseInt(e.target.value))}
                                        className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-slate-600 dark:accent-slate-400"
                                    />
                                    {isLarge && <span className="text-[9px] w-6 text-right theme-text-secondary">{volumes[sound.id]}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </WidgetWrapper>
    );
}
