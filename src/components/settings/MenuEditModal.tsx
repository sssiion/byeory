import { useState, useEffect, useRef } from 'react';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (order: string[]) => void;
}

const defaultMenuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      </svg>
    ),
  },
  {
    id: 'posts',
    label: '포스트',
    path: '/posts',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <line x1="10" y1="9" x2="8" y2="9"></line>
      </svg>
    ),
  },
  {
    id: 'todo',
    label: 'Todo',
    path: '/todo',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"></path>
        <path d="m9 11 3 3L22 4"></path>
      </svg>
    ),
  },
  {
    id: 'community',
    label: '커뮤니티',
    path: '/community',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <circle cx="9" cy="7" r="4"></circle>
      </svg>
    ),
  },
];

export default function MenuEditModal({ isOpen, onClose, onApply }: MenuEditModalProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  useEffect(() => {
    // 로컬 스토리지에서 메뉴 순서 불러오기
    const savedOrder = localStorage.getItem('menuOrder');
    if (savedOrder) {
      const order = JSON.parse(savedOrder) as string[];
      const orderedItems = order.map((id) => defaultMenuItems.find((item) => item.id === id)).filter((item): item is MenuItem => item !== undefined);
      setMenuItems(orderedItems);
    }
  }, []);

  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItemRef.current = index;
  };

  const handleDragEnd = () => {
    if (dragItemRef.current !== null && dragOverItemRef.current !== null) {
      const newItems = [...menuItems];
      const draggedItem = newItems[dragItemRef.current];
      newItems.splice(dragItemRef.current, 1);
      newItems.splice(dragOverItemRef.current, 0, draggedItem);
      setMenuItems(newItems);
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
    setDraggedIndex(null);
  };

  const handleApply = () => {
    const order = menuItems.map((item) => item.id);
    localStorage.setItem('menuOrder', JSON.stringify(order));
    onApply(order);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 블러 오버레이 - 네비게이션 영역 제외 */}
      <div className="fixed inset-0 z-[105] bg-black/60 backdrop-blur-md" onClick={onClose}></div>

      {/* 메뉴 편집 모달 */}
      <div className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="bg-bg-secondary border-border pointer-events-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
          {/* 헤더 */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-text-primary text-2xl">메뉴 편집</h2>
            <button onClick={onClose} className="text-text-muted hover:bg-button-hover rounded-full p-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* 안내 텍스트 */}
          <div className="bg-accent-primary/10 text-accent-primary mb-6 rounded-lg p-4 text-sm">
            <div className="mb-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span className="font-semibold">메뉴 순서 변경</span>
            </div>
            <p className="text-text-secondary ml-6 text-xs">드래그하여 메뉴 순서를 변경한 후 적용 버튼을 눌러주세요.</p>
          </div>

          {/* 드래그 가능한 메뉴 아이템 리스트 */}
          <div className="mb-6 space-y-3">
            {menuItems.map((item, index) => (
              <div key={item.id} draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className={`border-border bg-bg-primary hover:border-accent-primary flex cursor-move items-center gap-4 rounded-lg border-2 border-dashed p-4 transition-all ${draggedIndex === index ? 'opacity-50' : ''}`}>
                {/* 드래그 핸들 아이콘 */}
                <div className="text-text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="9" x2="20" y2="9"></line>
                    <line x1="4" y1="15" x2="20" y2="15"></line>
                  </svg>
                </div>

                {/* 메뉴 아이콘 */}
                <div className="text-accent-primary">{item.icon}</div>

                {/* 메뉴 레이블 */}
                <span className="text-text-primary flex-1">{item.label}</span>

                {/* 순서 표시 */}
                <span className="text-text-muted text-sm">#{index + 1}</span>
              </div>
            ))}
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-3">
            <button onClick={onClose} className="border-border text-text-primary hover:bg-button-hover flex-1 rounded-lg border-2 px-4 py-3 transition-colors">
              취소
            </button>
            <button onClick={handleApply} className="bg-accent-primary hover:bg-accent-hover flex-1 rounded-lg px-4 py-3 text-white transition-colors">
              적용
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
