import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EffectController } from './SharedController';
import { Box, Settings, X, Activity } from 'lucide-react';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
}

const PortalEffectWithProps = ({ multiplier, sensitivity }: { multiplier: number, sensitivity: number }) => {
    const requestRef = useRef<number>(0);

    useEffect(() => {
        let shakeIntensity = 0;
        let lastX = 0;
        let lastY = 0;
        let activeBodies: HTMLElement[] = [];

        const handleMouseMove = (e: MouseEvent) => {
            const dx = Math.abs(e.clientX - lastX);
            const dy = Math.abs(e.clientY - lastY);

            if (dx + dy > sensitivity) {
                shakeIntensity = Math.min(shakeIntensity + 5, 20);
                if (activeBodies.length === 0 || Math.random() < 0.1) {
                    activeBodies = Array.from(document.querySelectorAll('.global-physics-widget'));
                }
            }
            lastX = e.clientX;
            lastY = e.clientY;
        };

        const updateLoop = () => {
            if (shakeIntensity > 0.1) {
                shakeIntensity *= 0.9;
                activeBodies.forEach((b) => {
                    const force = shakeIntensity * multiplier;
                    const rx = (Math.random() - 0.5) * force;
                    const ry = (Math.random() - 0.5) * force;
                    const rr = (Math.random() - 0.5) * force * 0.5;
                    b.style.transform = `translate(${rx}px, ${ry}px) rotate(${rr}deg)`;
                });
            } else if (shakeIntensity !== 0) {
                shakeIntensity = 0;
                activeBodies.forEach((b) => {
                    b.style.transform = '';
                });
            }
            requestRef.current = requestAnimationFrame(updateLoop);
        };

        window.addEventListener('mousemove', handleMouseMove);
        updateLoop();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(requestRef.current);
            document.querySelectorAll('.global-physics-widget').forEach((b) => {
                (b as HTMLElement).style.transform = '';
            });
        };
    }, [multiplier, sensitivity]);

    return null;
};

export const PhysicsBox = ({ className, style }: ComponentProps) => {
    const [showSettings, setShowSettings] = useState(false);

    // Initialize state from localStorage, with safer parsing
    const [settings, setSettings] = useState(() => {
        const savedMultiplier = localStorage.getItem('physics-multiplier');
        const savedSensitivity = localStorage.getItem('physics-sensitivity');
        return {
            multiplier: savedMultiplier ? Number(savedMultiplier) : 1,
            sensitivity: savedSensitivity ? Number(savedSensitivity) : 30
        };
    });

    const updateSetting = (key: keyof typeof settings, value: number) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem(`physics-${key}`, String(value));
    };

    return (
        <EffectController
            className={className}
            style={style}
            label="물리 상자"
            icon={<Box size={20} />}
            storageKey="effect-physics-box"
            onSettingsClick={() => setShowSettings(true)}
        >
            <>
                <PortalEffectWithProps multiplier={settings.multiplier} sensitivity={settings.sensitivity} />

                {showSettings && createPortal(
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50" onClick={() => setShowSettings(false)}>
                        <div className="bg-white rounded-2xl p-6 w-[320px] shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Activity className="text-orange-500" />
                                    Physics Settings
                                </h3>
                                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Shake Force (Intensity)</span>
                                        <span className="text-sm font-bold text-blue-600">{settings.multiplier}x</span>
                                    </div>
                                    <input
                                        type="range" min="0.5" max="3" step="0.1"
                                        value={settings.multiplier}
                                        onChange={(e) => updateSetting('multiplier', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Sensitivity (Threshold)</span>
                                        <span className="text-xs text-gray-500">{settings.sensitivity < 20 ? 'High' : settings.sensitivity > 50 ? 'Low' : 'Medium'}</span>
                                    </div>
                                    <input
                                        type="range" min="10" max="100" step="5"
                                        value={settings.sensitivity}
                                        onChange={(e) => updateSetting('sensitivity', parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                                        style={{ direction: 'rtl' }}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Lower value = Easiest to trigger</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </>
        </EffectController>
    );
};
