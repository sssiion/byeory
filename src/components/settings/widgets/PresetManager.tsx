import React, { useState, useEffect } from 'react';
import { Trash2, FolderOpen, Plus, X, Check, RefreshCw } from 'lucide-react';
import type { WidgetInstance } from "./type";
import { getPresets, createPreset, deletePreset, updatePreset, type WidgetPreset } from '../../../services/widgetSettings';

// ... interface WidgetPreset (remove local definition if imported, or keep compatible)

interface PresetManagerProps {
    currentWidgets: WidgetInstance[];
    currentGridSize: { cols: number; rows: number };
    onLoad: (widgets: WidgetInstance[], gridSize: { cols: number; rows: number }) => void;
    onClose: () => void;
}

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
        loadPresets();
    }, []);

    const loadPresets = async () => {
        try {
            const data = await getPresets();
            setPresets(data);
        } catch (e) {
            console.error("Failed to load presets", e);
        }
    };

    const handleCreate = async () => {
        if (!newPresetName.trim()) return;
        try {
            await createPreset(newPresetName.trim(), currentWidgets, currentGridSize);
            await loadPresets();
            setNewPresetName('');
            setIsCreating(false);
        } catch (e) {
            console.error("Failed to create preset", e);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            try {
                await deletePreset(id);
                await loadPresets();
            } catch (e) {
                console.error("Failed to delete preset", e);
            }
        }
    };

    const handleOverwrite = async (id: number) => {
        if (confirm('현재 배치로 이 프리셋을 덮어쓰시겠습니까?')) {
            try {
                await updatePreset(id, currentWidgets, currentGridSize);
                await loadPresets();
            } catch (e) {
                console.error("Failed to update preset", e);
            }
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString();
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
