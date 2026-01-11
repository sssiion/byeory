import React from 'react';
import { Clock } from 'lucide-react';
import { useHeaderSettings } from '../../../hooks/useHeaderSettings';

const SessionSettings: React.FC = () => {
    const { settings, updateSettings } = useHeaderSettings();

    const toggleSessionTimer = () => {
        updateSettings({ showTimer: !settings.showTimer });
    };

    return (
        <button
            onClick={toggleSessionTimer}
            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border"
        >
            <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 theme-text-secondary" />
                <div>
                    <span className="block theme-text-primary">접속 시간 표시</span>
                    <span className="text-sm theme-text-secondary">상단바에 현재 접속 시간 표시</span>
                </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.showTimer ? 'bg-[var(--btn-bg)]' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.showTimer ? 'right-1' : 'left-1'}`}></div>
            </div>
        </button>
    );
};

export default SessionSettings;
