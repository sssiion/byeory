import React, { useRef, useState, useEffect } from 'react';
import { Plus, RefreshCw, LayoutGrid, AlignStartVertical, FolderOpen } from 'lucide-react';
import MenuSettings from '../../settings/menu/MenuSettings';
import type { WidgetInstance } from '../../settings/widgets/type';

interface DashboardHeaderProps {
    isMenuEditMode: boolean;
    isWidgetEditMode: boolean;
    isMobile: boolean;
    widgetSnapshot: WidgetInstance[] | null;
    setIsWidgetEditMode: (value: boolean) => void;
    setWidgets: (widgets: WidgetInstance[]) => void;
    setIsCatalogOpen: (value: boolean) => void;
    setIsBuilderOpen: (value: boolean) => void;
    setIsArrangeConfirmOpen: (value: boolean) => void;
    setIsPresetManagerOpen: (value: boolean) => void;
    resetWidgets: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    isMenuEditMode,
    isWidgetEditMode,
    isMobile,
    widgetSnapshot,
    setIsWidgetEditMode,
    setWidgets,
    setIsCatalogOpen,
    setIsBuilderOpen,
    setIsArrangeConfirmOpen,
    setIsPresetManagerOpen,
    resetWidgets
}) => {
    const controlsRef = useRef<HTMLDivElement>(null);
    const [showRightBlur, setShowRightBlur] = useState(false);

    useEffect(() => {
        const el = controlsRef.current;
        if (!el) return;
        const checkScroll = () => {
            setShowRightBlur(el.scrollWidth > el.clientWidth + el.scrollLeft + 1);
        };
        el.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);
        checkScroll();
        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [isWidgetEditMode, isMenuEditMode, isMobile]);

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold theme-text-primary flex items-center gap-2">
                <LayoutGrid size={20} /> My Dashboard
            </h2>

            <div
                ref={controlsRef}
                className={`flex gap-2 items-center ${isMobile ? 'flex-nowrap overflow-x-auto w-full pb-2 no-scrollbar' : 'flex-wrap'} ${isMobile && showRightBlur ? 'mask-linear-fade' : ''}`}
            >
                {!isMenuEditMode && (
                    <>
                        {isWidgetEditMode && (
                            <>
                                <button onClick={() => setIsWidgetEditMode(false)} className="h-10 px-4 w-20 flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold bg-[var(--btn-bg)] text-[var(--btn-text)] shadow-md transition-colors">
                                    Save
                                </button>
                                <button onClick={() => { if (widgetSnapshot) setWidgets(widgetSnapshot); setIsWidgetEditMode(false); }} className="h-10 px-4 w-20 flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                    Cancel
                                </button>
                                <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0"></div>
                                <button onClick={() => setIsCatalogOpen(true)} className="h-10 px-4 w-20 flex-shrink-0 flex items-center justify-center gap-1 rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-colors">
                                    <Plus size={18} /> Add
                                </button>
                                <button onClick={() => setIsBuilderOpen(true)} className="h-10 px-4 flex-shrink-0 flex items-center justify-center gap-1 rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-colors">
                                    <span>새 버튼</span>
                                </button>
                                <button onClick={() => setIsArrangeConfirmOpen(true)} className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--btn-bg)] hover:bg-[var(--bg-card-secondary)] transition-colors" title="Auto Arrange">
                                    <AlignStartVertical size={18} />
                                </button>
                                <button onClick={() => setIsPresetManagerOpen(true)} className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--btn-bg)] hover:bg-[var(--bg-card-secondary)] transition-colors" title="Presets">
                                    <FolderOpen size={18} />
                                </button>
                                <button onClick={resetWidgets} className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Reset Layout">
                                    <RefreshCw size={20} />
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
            {isMenuEditMode && <MenuSettings />}
        </div>
    );
};

export default DashboardHeader;
