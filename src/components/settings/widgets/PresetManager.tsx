import React, { useState, useEffect } from 'react';
import { Trash2, FolderOpen, Plus, X, Check, RefreshCw } from 'lucide-react';
import type { WidgetPreset } from '../../../types/preset';
import type { WidgetInstance } from './Registry';

interface PresetManagerProps {
    currentWidgets: WidgetInstance[];
    currentGridSize: { cols: number; rows: number };
    onLoad: (widgets: WidgetInstance[], gridSize: { cols: number; rows: number }) => void;
    onClose: () => void;
}

const STORAGE_KEY = 'my_dashboard_presets';

export const PresetManager: React.FC<PresetManagerProps> = ({
    currentWidgets,
    currentGridSize,
    onLoad,
    onClose
}) => {
    const [presets, setPresets] = useState<WidgetPreset[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setPresets(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load presets", e);
            }
        }
    }, []);

    const savePresets = (newPresets: WidgetPreset[]) => {
        setPresets(newPresets);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
    };

    const handleCreate = () => {
        if (!newPresetName.trim()) return;

        const newPreset: WidgetPreset = {
            id: crypto.randomUUID(),
            name: newPresetName.trim(),
            createdAt: Date.now(),
            widgets: currentWidgets,
            gridSize: currentGridSize
        };

        const updated = [newPreset, ...presets];
        savePresets(updated);
        setNewPresetName('');
        setIsCreating(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            const updated = presets.filter(p => p.id !== id);
            savePresets(updated);
        }
    };

    const handleOverwrite = (id: string) => {
        if (confirm('현재 배치로 이 프리셋을 덮어쓰시겠습니까?')) {
            const updated = presets.map(p => {
                if (p.id === id) {
                    return {
                        ...p,
                        widgets: currentWidgets,
                        gridSize: currentGridSize,
                        createdAt: Date.now()
                    };
                }
                return p;
            });
            savePresets(updated);
        }
    };

    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleDateString() + ' ' + new Date(ts).toLocaleTimeString();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[var(--bg-card)] w-full max-w-md h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[var(--border-color)]">
                {/* Header */}
                <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-header)] shrink-0">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <FolderOpen size={20} /> 위젯 프리셋
                    </h3>
                    <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <X size={20} />
                    </button>
                </div>

                {/* Fixed Content: Create New UI */}
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] z-10 shrink-0">
                    {isCreating ? (
                        <div className="bg-[var(--bg-card-secondary)] p-3 rounded-xl border border-[var(--border-color)] animate-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">프리셋 이름</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newPresetName}
                                    onChange={(e) => setNewPresetName(e.target.value)}
                                    placeholder="My Awesome Layout"
                                    className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)]"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                />
                                <button
                                    onClick={handleCreate}
                                    disabled={!newPresetName.trim()}
                                    className="bg-[var(--btn-bg)] text-[var(--btn-text)] p-2 rounded-lg disabled:opacity-50"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] p-2 rounded-lg"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full py-3 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-text)] hover:brightness-110 transition-all flex items-center justify-center gap-2 font-bold shadow-md"
                        >
                            <Plus size={18} /> 현재 배치 저장하기
                        </button>
                    )}
                </div>

                {/* Scrollable Content: List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {presets.length === 0 ? (
                        <div className="text-center py-10 text-[var(--text-secondary)] text-sm">
                            저장된 프리셋이 없습니다.
                        </div>
                    ) : (
                        presets.map(preset => (
                            <div key={preset.id} className="group bg-[var(--bg-card-secondary)] p-3 rounded-xl border border-[var(--border-color)] hover:border-[var(--btn-bg)] transition-colors flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="font-bold text-[var(--text-primary)]">{preset.name}</div>
                                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                                        {formatDate(preset.createdAt)} • {preset.widgets.length} Widgets
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onLoad(preset.widgets, preset.gridSize)}
                                        className="p-2 rounded-lg bg-[var(--btn-bg)] text-[var(--btn-text)] hover:brightness-110 text-xs font-bold px-3"
                                    >
                                        Load
                                    </button>
                                    <button
                                        onClick={() => handleOverwrite(preset.id)}
                                        className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]"
                                        title="Update with current layout"
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(preset.id)}
                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                </div>
            </div>
        </div>
    );
};
