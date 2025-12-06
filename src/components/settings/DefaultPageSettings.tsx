import { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <circle cx="9" cy="7" r="4"></circle>
      </svg>
    ),
  },
];

interface DefaultPageSettingsProps {
  onBack: () => void;
  onClose: () => void;
}

export default function DefaultPageSettings({ onBack, onClose }: DefaultPageSettingsProps) {
  const [selectedPage, setSelectedPage] = useState<string>('home');

  useEffect(() => {
    // 로컬 스토리지에서 기본 페이지 불러오기
    const savedDefaultPage = localStorage.getItem('defaultPage');
    if (savedDefaultPage) {
      setSelectedPage(savedDefaultPage);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('defaultPage', selectedPage);
    onClose();
  };

  return (
    <>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-text-muted hover:bg-button-hover rounded-full p-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2 className="text-text-primary text-xl">기본 페이지 설정</h2>
        <button onClick={onClose} className="text-text-muted hover:bg-button-hover rounded-full p-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 설명 */}
      <div className="bg-accent-primary/10 text-accent-primary mb-6 rounded-lg p-4 text-center text-sm">
        <p>앱을 실행할 때 처음 표시할 페이지를 선택하세요</p>
      </div>

      {/* 페이지 선택 버튼 그리드 */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => setSelectedPage(item.id)} className={`group border-2 transition-all hover:scale-105 ${selectedPage === item.id ? 'border-accent-primary bg-accent-primary/10' : 'border-border bg-bg-secondary hover:border-accent-primary'} flex flex-col items-center justify-center gap-3 rounded-lg p-6`}>
            <div className={`transition-colors ${selectedPage === item.id ? 'text-accent-primary' : 'text-accent-primary group-hover:text-accent-hover'}`}>{item.icon}</div>
            <span className="text-text-primary">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 저장 버튼 */}
      <button onClick={handleSave} className="bg-accent-primary hover:bg-accent-hover w-full rounded-lg py-3 text-white transition-colors">
        저장
      </button>
    </>
  );
}
