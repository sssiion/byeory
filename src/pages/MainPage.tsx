import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '../components/Header/Navigation';
import MenuSettings, { useMenu } from '../components/settings/menu/MenuSettings';
import { WIDGET_REGISTRY, type WidgetType, type WidgetInstance, type WidgetLayout } from '../components/widgets/Registry';
import { DraggableWidget } from '../components/widgets/DraggableWidget';
import { Plus, X, RotateCcw, LayoutGrid } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DEFAULT_LAYOUTS: Record<string, WidgetLayout> = {
    'small': { cols: 1, rows: 1 }, // 1x1
    'medium': { cols: 2, rows: 1 }, // 2x1
    'large': { cols: 2, rows: 2 }, // 2x2
    'wide': { cols: 4, rows: 1 }, // 4x1 (Full width mobile)
};

const DEFAULT_WIDGETS: WidgetInstance[] = [
    { id: 'w-1', type: 'welcome', layout: DEFAULT_LAYOUTS['wide'] },
    { id: 'w-2', type: 'theme-guide', layout: DEFAULT_LAYOUTS['medium'] },
    { id: 'w-3', type: 'feature-card', props: { title: "Feature 1", description: "첫 번째 기능 설명입니다.", icon: "1" }, layout: DEFAULT_LAYOUTS['small'] },
    { id: 'w-4', type: 'feature-card', props: { title: "Feature 2", description: "두 번째 기능 설명입니다.", icon: "2" }, layout: DEFAULT_LAYOUTS['small'] },
    { id: 'w-5', type: 'feature-card', props: { title: "Feature 3", description: "세 번째 기능 설명입니다.", icon: "3" }, layout: DEFAULT_LAYOUTS['small'] },
];

const MainPage: React.FC = () => {
    const { isEditMode: isMenuEditMode } = useMenu();
    const [isWidgetEditMode, setIsWidgetEditMode] = useState(false);
    const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('my_dashboard_widgets_v2');
        if (saved) {
            try {
                setWidgets(JSON.parse(saved));
            } catch (e) {
                setWidgets(DEFAULT_WIDGETS);
            }
        } else {
            setWidgets(DEFAULT_WIDGETS);
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (widgets.length > 0) {
            localStorage.setItem('my_dashboard_widgets_v2', JSON.stringify(widgets));
        }
    }, [widgets]);

    const addWidget = (type: WidgetType) => {
        const registryItem = WIDGET_REGISTRY[type];
        const defaultLayout = registryItem.defaultSize ? DEFAULT_LAYOUTS[registryItem.defaultSize] : { cols: 1, rows: 1 };

        // Fallback if registry item/layout is undefined for some reason, though types should prevent this
        const safeLayout = defaultLayout || { cols: 1, rows: 1 };

        const newWidget: WidgetInstance = {
            id: `w-${Date.now()}`,
            type,
            props: registryItem.defaultProps,
            layout: safeLayout
        };
        setWidgets(prev => [...prev, newWidget]);
        setIsCatalogOpen(false);
    };

    const removeWidget = (id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
    };

    const resetWidgets = () => {
        if (confirm("모든 위젯을 초기 상태로 되돌리시겠습니까?")) {
            setWidgets(DEFAULT_WIDGETS);
            localStorage.removeItem('my_dashboard_widgets_v2');
        }
    };

    const moveWidget = useCallback((dragIndex: number, hoverIndex: number) => {
        setWidgets((prevWidgets) => {
            const newWidgets = [...prevWidgets];
            const [draggedWidget] = newWidgets.splice(dragIndex, 1);
            newWidgets.splice(hoverIndex, 0, draggedWidget);
            return newWidgets;
        });
    }, []);

    const updateLayout = (id: string, cols: number, rows: number) => {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, layout: { cols, rows } } : w));
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen pb-20">
                <Navigation />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Controls Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold theme-text-primary flex items-center gap-2">
                            <LayoutGrid size={20} /> My Dashboard
                        </h2>
                        <div className="flex gap-2">
                            {!isMenuEditMode && (
                                <>
                                    <button
                                        onClick={() => setIsWidgetEditMode(!isWidgetEditMode)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isWidgetEditMode
                                                ? 'bg-[var(--btn-bg)] text-white shadow-md'
                                                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)]'
                                            }`}
                                    >
                                        {isWidgetEditMode ? 'Done' : 'Edit Widgets'}
                                    </button>
                                    {isWidgetEditMode && (
                                        <>
                                            <button
                                                onClick={() => setIsCatalogOpen(true)}
                                                className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--btn-bg)] hover:bg-[var(--bg-card-secondary)] font-bold flex items-center gap-1"
                                            >
                                                <Plus size={16} /> Add
                                            </button>
                                            <button
                                                onClick={resetWidgets}
                                                className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-red-400 hover:text-red-500 hover:bg-red-50"
                                                title="Reset Layout"
                                            >
                                                <RotateCcw size={18} />
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Global Theme Settings Mode */}
                    {isMenuEditMode ? (
                        <MenuSettings />
                    ) : (
                        <div className="relative min-h-[500px]">

                            {/* Background Grid Visualization (Only in Edit Mode) */}
                            {isWidgetEditMode && (
                                <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px] pointer-events-none z-0 opacity-20">
                                    {Array.from({ length: 48 }).map((_, i) => (
                                        <div key={i} className="border-2 border-dashed border-gray-400 rounded-xl" />
                                    ))}
                                </div>
                            )}

                            {/* Widget Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)] relative z-10 transition-all duration-300 ease-in-out">
                                {widgets.map((widget, index) => (
                                    <DraggableWidget
                                        key={widget.id}
                                        index={index}
                                        widget={widget}
                                        isEditMode={isWidgetEditMode}
                                        moveWidget={moveWidget}
                                        removeWidget={removeWidget}
                                        updateLayout={updateLayout}
                                    />
                                ))}

                                {/* Empty State */}
                                {widgets.length === 0 && (
                                    <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] bg-[var(--bg-card-secondary)]">
                                        <p className="mb-4">위젯이 없습니다. 위젯을 추가해보세요!</p>
                                        <button
                                            onClick={() => setIsCatalogOpen(true)}
                                            className="px-6 py-2 bg-[var(--btn-bg)] text-white rounded-lg font-bold shadow-sm"
                                        >
                                            위젯 추가하기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Widget Catalog Modal */}
                {isCatalogOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[var(--bg-card)] w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card-secondary)]">
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">위젯 보관함</h3>
                                <button onClick={() => setIsCatalogOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(WIDGET_REGISTRY).map(([type, item]) => (
                                    <div
                                        key={type}
                                        onClick={() => addWidget(type as WidgetType)}
                                        className="cursor-pointer group flex flex-col gap-2 p-2 rounded-xl hover:bg-[var(--bg-card-secondary)] border border-transparent hover:border-[var(--btn-bg)] transition-all"
                                    >
                                        <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative pointer-events-none">
                                            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-card)] text-[var(--text-secondary)] text-xs font-bold p-2 text-center border border-[var(--border-color)]">
                                                {item.label}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-[var(--text-primary)]">{item.label}</span>
                                            <Plus size={14} className="text-[var(--btn-bg)] opacity-0 group-hover:opacity-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DndProvider>
    );
};

export default MainPage;
