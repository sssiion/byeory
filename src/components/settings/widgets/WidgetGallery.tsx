import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, Plus, HelpCircle, X } from 'lucide-react';
import { WIDGET_REGISTRY, type WidgetType } from './Registry';
import { matchKoreanSearch } from '../../../utils/searchUtils';
import { useIsMobile } from '../../../hooks';

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'System': '시스템',
  'Data & Logic': '데이터 & 로직',
  'Diary & Emotion': '다이어리 & 감정',
  'Utility': '유틸리티',
  'Decoration': '꾸미기',
  'Collection': '수집품',
  'Interactive': '인터랙티브',
  'Tool': '도구',
  'Global': '글로벌 효과',
};

function WidgetContainer({ children, title, className = '', onInfoClick, isMobile }: { children: React.ReactNode; title: string; className?: string; onInfoClick?: (e: React.MouseEvent) => void, isMobile?: boolean }) {
  return (
    <div className={`flex flex-col w-full h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:border-blue-400 hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Thumbnail Area */}
      <div className="flex-1 min-h-0 relative isolate overflow-hidden bg-gray-50/30 flex items-center justify-center p-2">
        {children}
      </div>

      {/* Footer Area */}
      <div className="shrink-0 h-[40px] px-3 border-t border-gray-50 flex items-center justify-between bg-white z-10 relative">
        <h2 className="text-xs text-gray-700 font-bold truncate pr-2">
          {title}
        </h2>
        {/* Buttons: Hidden on mobile (use card click instead), hover on desktop */}
        <div className={`flex items-center gap-1 transition-all
            ${isMobile ? 'hidden' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}
        `}>
          <button
            onClick={onInfoClick}
            className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <HelpCircle size={12} />
          </button>
          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Plus size={14} strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface WidgetGalleryProps {
  onSelect?: (type: WidgetType) => void;
}

// Helper type for widget with its key
type WidgetEntry = (typeof WIDGET_REGISTRY)[keyof typeof WIDGET_REGISTRY] & { type: WidgetType };

export function WidgetGallery({ onSelect }: WidgetGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedInfoWidget, setSelectedInfoWidget] = useState<WidgetEntry | null>(null);
  const isMobile = useIsMobile(); // Initialize hook

  // Debounce Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Group Widgets by Category
  const groupedWidgets = useMemo(() => {
    const groups: Record<string, WidgetEntry[]> = {};
    // Default sort: Category > Label
    const sortedEntries = Object.entries(WIDGET_REGISTRY).sort(([, a], [, b]) => {
      if (a.category === b.category) return a.label.localeCompare(b.label);
      return a.category.localeCompare(b.category);
    });

    for (const [key, widget] of sortedEntries) {
      // Search Filter (Enhanced: Case/Space/Chosung/Description)
      // Chosung search is enabled only for Label and Keywords to reduce noise

      const isMatch =
        matchKoreanSearch(widget.label, debouncedSearch, { useChosung: true }) ||
        matchKoreanSearch(widget.category, debouncedSearch, { useChosung: false }) ||
        (widget.description && matchKoreanSearch(widget.description, debouncedSearch, { useChosung: false })) ||
        (widget.keywords && widget.keywords.some(k => matchKoreanSearch(k, debouncedSearch, { useChosung: true })));

      if (debouncedSearch && !isMatch) {
        continue;
      }

      const cat = widget.category || 'Other';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      // Attach the key (type) to the widget object for selection
      groups[cat].push({ ...widget, type: key as WidgetType });
    }

    return groups;
  }, [debouncedSearch]);


  // Effect to expand matching categories when search changes
  useEffect(() => {
    if (debouncedSearch) {
      const matchingCategories = Object.keys(groupedWidgets);
      setExpandedCategories(new Set(matchingCategories));
    } else {
      // Collapse all on clear
      setExpandedCategories(new Set());
    }
  }, [debouncedSearch, groupedWidgets]);


  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const categories = Object.keys(groupedWidgets).sort();

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)]">
      {/* Search Header */}
      <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="위젯 검색 (ex: 날씨, 할 일, ㅎㅇ)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-card-secondary)] border border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-sm"
            autoFocus
          />
        </div>
      </div>

      {/* Widget List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 overscroll-contain">
        {categories.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-secondary)]">
            <p className="text-sm">{debouncedSearch}에 대한 검색 결과가 없습니다.</p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category} className="rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card-secondary)]/30">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-card-secondary)] transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <div className={`transition-transform duration-200 ${expandedCategories.has(category) ? 'rotate-90 text-[var(--btn-bg)]' : 'text-gray-400'}`}>
                    <ChevronRight size={16} />
                  </div>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{CATEGORY_TRANSLATIONS[category] || category}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-[var(--bg-card)] text-[var(--text-secondary)] rounded-full border border-[var(--border-color)]">
                  {groupedWidgets[category].length}
                </span>
              </button>

              {expandedCategories.has(category) && (
                <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] grid grid-cols-2 lg:grid-cols-4 gap-3 animate-in slide-in-from-top-1 duration-200">
                  {groupedWidgets[category].map((widget) => (
                    <div
                      key={widget.type}
                      className="h-[120px] cursor-pointer"
                      onClick={() => {
                        if (isMobile) {
                          setSelectedInfoWidget(widget);
                        } else {
                          onSelect?.(widget.type);
                        }
                      }}
                    >
                      <WidgetContainer
                        title={widget.label}
                        isMobile={isMobile}
                        onInfoClick={(e) => {
                          e.stopPropagation();
                          setSelectedInfoWidget(widget);
                        }}
                      >
                        {widget.category === 'Global' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                            <div className="p-4 rounded-full bg-white shadow-sm border border-gray-100">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-[spin_10s_linear_infinite]">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={`/thumbnails/${widget.type}.png`}
                            alt={widget.label}
                            className="w-full h-full object-contain pointer-events-none select-none transition-transform hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              // Fallback if image fails
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                              const icon = document.createElement('div');
                              icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                              e.currentTarget.parentElement?.appendChild(icon);
                            }}
                          />
                        )}
                      </WidgetContainer>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Description Modal */}
      {selectedInfoWidget && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedInfoWidget(null)}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">{selectedInfoWidget.label}</h3>
              <button
                onClick={() => setSelectedInfoWidget(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                {/* Reuse same thumbnail logic or different display */}
                {selectedInfoWidget.category === 'Global' ? (
                  <div className="text-gray-400">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={`/thumbnails/${selectedInfoWidget.type}.png`}
                    className="w-full h-full object-contain"
                    alt={selectedInfoWidget.label}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {selectedInfoWidget.description || '이 위젯에 대한 설명이 없습니다.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Category</span>
                    <span className="text-xs font-medium text-gray-700">{CATEGORY_TRANSLATIONS[selectedInfoWidget.category] || selectedInfoWidget.category}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Size</span>
                    <span className="text-xs font-medium text-gray-700 font-mono">{selectedInfoWidget.defaultSize}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelect?.(selectedInfoWidget.type);
                  setSelectedInfoWidget(null);
                }}
                className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                위젯 추가하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
