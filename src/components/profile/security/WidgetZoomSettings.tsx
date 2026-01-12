import React from 'react';
import { Maximize } from 'lucide-react';
import { useHeaderSettings } from '../../../hooks/useHeaderSettings';

const WidgetZoomSettings: React.FC = () => {
    const { settings, updateSettings } = useHeaderSettings();

    const toggleWidgetZoom = () => {
        updateSettings({ showWidgetZoom: !settings.showWidgetZoom });
    };

    return (
        <button
            onClick={toggleWidgetZoom}
            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border"
        >
            <div className="flex items-center gap-3">
                <Maximize className="w-5 h-5 theme-text-secondary" />
                <div>
                    <span className="block theme-text-primary">위젯 확대 모드</span>
                    <span className="text-sm theme-text-secondary">위젯 클릭 시 크게 확대해서 보기</span>
                </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.showWidgetZoom ? 'bg-[var(--btn-bg)]' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.showWidgetZoom ? 'right-1' : 'left-1'}`}></div>
            </div>
        </button>
    );
};

export default WidgetZoomSettings;
