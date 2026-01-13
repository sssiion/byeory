import React, { useState, useEffect } from 'react';
import { Palette, Menu, Home, Layout, Plus, RefreshCw, AlignStartVertical, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../../settings/menu/MenuSettings';

interface FloatingSettingsPanelProps {
    defaultOpen?: boolean; // ✨ New Prop
    isWidgetEditMode?: boolean; // Optional
    setIsWidgetEditMode?: (value: boolean) => void; // Optional
    setIsCatalogOpen?: (value: boolean) => void; // Optional
    setIsBuilderOpen?: (value: boolean) => void; // Optional
    setIsArrangeConfirmOpen?: (value: boolean) => void; // Optional
    setIsPresetManagerOpen?: (value: boolean) => void; // Optional
    resetWidgets?: () => void; // Optional
    isMobile: boolean;
}

const FloatingSettingsPanel: React.FC<FloatingSettingsPanelProps> = ({
    defaultOpen = false, // ✨ Default false if not provided
    isWidgetEditMode,
    setIsWidgetEditMode,
    setIsCatalogOpen,
    setIsBuilderOpen,
    setIsArrangeConfirmOpen,
    setIsPresetManagerOpen,
    resetWidgets,
    isMobile
}) => {
    // ✨ Use defaultOpen prop, but force closed on mobile initial load
    const [isOpen, setIsOpen] = useState(defaultOpen && !isMobile);
    const navigate = useNavigate();
    const { setIsEditMode } = useMenu();

    // Close panel when switching to mobile
    useEffect(() => {
        if (isMobile) {
            setIsOpen(false);
        }
    }, [isMobile]);

    const openSettings = (view: string) => {
        window.dispatchEvent(new CustomEvent('open-settings-modal', { detail: { view } }));
    };

    const hasWidgetProps = isWidgetEditMode !== undefined && setIsWidgetEditMode && setIsCatalogOpen && setIsBuilderOpen && setIsArrangeConfirmOpen && setIsPresetManagerOpen && resetWidgets;

    return (
        <>
            {/* Toggle Button (Visible when closed) */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed right-0 top-32 z-[90] mt-6 flex items-center justify-center w-12 h-14 
                bg-[var(--bg-card)]/80 backdrop-blur-xl border-y border-l border-[var(--border-color)] 
                rounded-l-2xl hover:bg-[var(--bg-card-secondary)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[-4px_4px_12px_-2px_rgba(0,0,0,0.1)]
                ${isOpen ? 'translate-x-[150%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}
                title="설정 열기"
            >
                <ChevronLeft className="w-6 h-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" />
            </button>

            {/* Panel Content (Slides in/out) */}
            <div
                className={`fixed right-0 top-32 z-[90] w-64 flex flex-col gap-4 bg-[var(--bg-card)]/80 backdrop-blur-xl border-y border-l border-[var(--border-color)] rounded-l-3xl p-5 min-h-[240px] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}
            >
                <div className="flex items-center mb-2 px-1">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-1 group hover:bg-[var(--bg-card-secondary)]/50 -ml-2 px-2 py-1 rounded-lg transition-all"
                        title="접기"
                    >
                        <h3 className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">설정</h3>
                        <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                    </button>
                </div>

                <button
                    onClick={() => openSettings('theme')}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card-secondary)] transition-all group text-left"
                >
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform">
                        <Palette size={18} />
                    </div>
                    <div>
                        <div className="font-bold text-[var(--text-primary)] text-sm">테마 설정</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">나만의 디자인 꾸미기</div>
                    </div>
                </button>

                <button
                    onClick={() => {
                        setIsEditMode(true);
                        navigate('/home');
                        setIsOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card-secondary)] transition-all group text-left"
                >
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform">
                        <Menu size={18} />
                    </div>
                    <div>
                        <div className="font-bold text-[var(--text-primary)] text-sm">메뉴 편집</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">네비게이션 순서 변경</div>
                    </div>
                </button>

                <button
                    onClick={() => openSettings('defaultPage')}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card-secondary)] transition-all group text-left"
                >
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 group-hover:scale-110 transition-transform">
                        <Home size={18} />
                    </div>
                    <div>
                        <div className="font-bold text-[var(--text-primary)] text-sm">기본 페이지</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">시작 화면 설정</div>
                    </div>
                </button>

                {/* Widget Edit Toggle - Only if supported */}
                {hasWidgetProps && setIsWidgetEditMode && (
                    <button
                        onClick={() => setIsWidgetEditMode(!isWidgetEditMode)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all group text-left ${isWidgetEditMode ? 'bg-[var(--btn-bg)]/10 border border-[var(--btn-bg)]' : 'hover:bg-[var(--bg-card-secondary)]'}`}
                    >
                        <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${isWidgetEditMode ? 'bg-[var(--btn-bg)] text-white' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300'}`}>
                            <Layout size={18} />
                        </div>
                        <div>
                            <div className={`font-bold text-sm ${isWidgetEditMode ? 'text-[var(--btn-bg)]' : 'text-[var(--text-primary)]'}`}>위젯 편집</div>
                            <div className="text-[10px] text-[var(--text-secondary)]">{isWidgetEditMode ? '편집 모드 종료' : '위젯 배치 및 설정'}</div>
                        </div>
                    </button>
                )}

                {/* Widget Tools (Visible only when Edit Mode is ON) */}
                {hasWidgetProps && isWidgetEditMode && setIsCatalogOpen && setIsBuilderOpen && setIsPresetManagerOpen && setIsArrangeConfirmOpen && resetWidgets && (
                    <div className="pt-2 border-t border-[var(--border-color)] flex flex-col gap-2 animate-in slide-in-from-right-5 fade-in duration-300">
                        <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-2 px-1">위젯 도구</h3>

                        <button onClick={() => setIsCatalogOpen(true)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-card-secondary)] transition-colors text-left group">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--btn-bg)] group-hover:text-white transition-colors">
                                <Plus size={16} />
                            </div>
                            <span className="text-sm font-medium text-[var(--text-primary)]">위젯 추가</span>
                        </button>

                        <button onClick={() => setIsBuilderOpen(true)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-card-secondary)] transition-colors text-left group">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--btn-bg)] group-hover:text-white transition-colors">
                                <span className="text-[10px] font-bold">New</span>
                            </div>
                            <span className="text-sm font-medium text-[var(--text-primary)]">새 버튼 만들기</span>
                        </button>

                        <button onClick={() => setIsPresetManagerOpen(true)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-card-secondary)] transition-colors text-left group">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--btn-bg)] group-hover:text-white transition-colors">
                                <FolderOpen size={16} />
                            </div>
                            <span className="text-sm font-medium text-[var(--text-primary)]">프리셋 불러오기</span>
                        </button>

                        <div className="h-px bg-[var(--border-color)] my-1" />

                        <button onClick={() => setIsArrangeConfirmOpen(true)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-card-secondary)] transition-colors text-left group">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--btn-bg)] group-hover:text-white transition-colors">
                                <AlignStartVertical size={16} />
                            </div>
                            <span className="text-sm font-medium text-[var(--text-primary)]">자동 정렬</span>
                        </button>

                        <button onClick={resetWidgets} className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-red-400 group-hover:text-red-500 transition-colors">
                                <RefreshCw size={16} />
                            </div>
                            <span className="text-sm font-medium text-red-500">레이아웃 초기화</span>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
export default FloatingSettingsPanel;
