import React from 'react';
import { Sliders } from 'lucide-react';
import { useHeaderSettings } from '../../../hooks/useHeaderSettings';

const FloatingPanelSettings: React.FC = () => {
    const { settings, updateSettings } = useHeaderSettings();

    const toggleFloatingPanel = () => {
        updateSettings({ showFloatingPanel: !settings.showFloatingPanel });
    };

    return (
        <button
            onClick={toggleFloatingPanel}
            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border"
        >
            <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 theme-text-secondary" />
                <div>
                    <span className="block theme-text-primary">설정 플로팅바 표시</span>
                    <span className="text-sm theme-text-secondary">화면 우측에 빠른 설정 패널 표시</span>
                </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.showFloatingPanel ? 'bg-[var(--btn-bg)]' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.showFloatingPanel ? 'right-1' : 'left-1'}`}></div>
            </div>
        </button>
    );
};

export default FloatingPanelSettings;
