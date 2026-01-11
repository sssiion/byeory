import React from 'react';
import { Coins } from 'lucide-react';
import { useHeaderSettings } from '../../../hooks/useHeaderSettings';

const CreditSettings: React.FC = () => {
    const { settings, updateSettings } = useHeaderSettings();

    const toggleCredit = () => {
        updateSettings({ showCredit: !settings.showCredit });
    };

    return (
        <button
            onClick={toggleCredit}
            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border"
        >
            <div className="flex items-center gap-3">
                <Coins className="w-5 h-5 theme-text-secondary" />
                <div>
                    <span className="block theme-text-primary">재화 표시</span>
                    <span className="text-sm theme-text-secondary">상단바에 보유 재화(별사탕) 표시</span>
                </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.showCredit ? 'bg-[var(--btn-bg)]' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.showCredit ? 'right-1' : 'left-1'}`}></div>
            </div>
        </button>
    );
};

export default CreditSettings;
