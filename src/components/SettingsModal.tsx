import { useTheme } from '../contexts/ThemeContext';
import type { Theme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsView = 'main' | 'theme' | 'custom';
type CustomTab = 'auto' | 'manual';

type ColorName =
  | 'rose'
  | 'orange'
  | 'yellow'
  | 'lime'
  | 'emerald'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'slate';

// CSS 변수에서 색상 값 가져오기
const getColorValue = (colorName: ColorName, shade: number): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${colorName}-${shade}`)
    .trim();
};

function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [selectedTheme, setSelectedTheme] = useState<Theme>(theme);
  const [customTab, setCustomTab] = useState<CustomTab>('auto');
  const [selectedColor, setSelectedColor] = useState<ColorName | null>(null);

  // 모달이 열릴 때 현재 테마로 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(theme);
      // custom 테마인 경우 저장된 색상 불러오기
      if (theme === 'custom') {
        const savedColor = localStorage.getItem(
          'customThemeColor',
        ) as ColorName | null;
        if (savedColor) {
          setSelectedColor(savedColor);
        }
      }
    }
  }, [isOpen, theme]);

  // 테마 선택 시 실시간 미리보기
  useEffect(() => {
    if (isOpen) {
      const root = document.documentElement;
      document.documentElement.setAttribute('data-theme', selectedTheme);

      // custom이 아닌 테마를 선택하면 inline style 제거
      if (selectedTheme !== 'custom') {
        root.style.removeProperty('--bg-primary');
        root.style.removeProperty('--bg-secondary');
        root.style.removeProperty('--text-primary');
        root.style.removeProperty('--text-secondary');
        root.style.removeProperty('--text-muted');
        root.style.removeProperty('--accent-primary');
        root.style.removeProperty('--accent-hover');
        root.style.removeProperty('--border-color');
        root.style.removeProperty('--nav-bg');
        root.style.removeProperty('--button-hover-bg');
      }
    }
  }, [selectedTheme, isOpen]);

  if (!isOpen) return null;

  const themes: { value: Theme; label: string; description: string }[] = [
    {
      value: 'default',
      label: '기본 테마',
      description: '따뜻한 오렌지 색상의 기본 테마',
    },
    {
      value: 'light',
      label: '라이트 모드',
      description: '밝고 깔끔한 화이트 테마',
    },
    { value: 'dark', label: '다크 모드', description: '눈이 편한 다크 테마' },
    {
      value: 'custom',
      label: '개인 설정',
      description: '나만의 색상으로 꾸미기',
    },
  ];

  const handleClose = () => {
    // 닫을 때는 원래 테마(또는 적용된 테마)로 복구/유지
    const root = document.documentElement;
    document.documentElement.setAttribute('data-theme', theme);

    // 원래 테마가 custom이 아니면 inline style 제거
    if (theme !== 'custom') {
      root.style.removeProperty('--bg-primary');
      root.style.removeProperty('--bg-secondary');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--text-secondary');
      root.style.removeProperty('--text-muted');
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--accent-hover');
      root.style.removeProperty('--border-color');
      root.style.removeProperty('--nav-bg');
      root.style.removeProperty('--button-hover-bg');
    } else {
      // custom 테마인 경우 저장된 색상 다시 적용
      const savedColor = localStorage.getItem('customThemeColor');
      if (savedColor) {
        const getColorValue = (colorName: string, shade: number): string => {
          return getComputedStyle(document.documentElement)
            .getPropertyValue(`--color-${colorName}-${shade}`)
            .trim();
        };
        root.style.setProperty('--bg-primary', getColorValue(savedColor, 50));
        root.style.setProperty('--bg-secondary', 'rgb(255 255 255)');
        root.style.setProperty(
          '--text-primary',
          getColorValue(savedColor, 900),
        );
        root.style.setProperty(
          '--text-secondary',
          getColorValue(savedColor, 600),
        );
        root.style.setProperty('--text-muted', getColorValue(savedColor, 400));
        root.style.setProperty(
          '--accent-primary',
          getColorValue(savedColor, 500),
        );
        root.style.setProperty(
          '--accent-hover',
          getColorValue(savedColor, 600),
        );
        root.style.setProperty(
          '--border-color',
          getColorValue(savedColor, 300),
        );
        root.style.setProperty('--nav-bg', 'rgb(255 255 255)');
        root.style.setProperty(
          '--button-hover-bg',
          getColorValue(savedColor, 100),
        );
      }
    }

    setCurrentView('main');
    onClose();
  };

  const handleApplyTheme = () => {
    setTheme(selectedTheme);
    setCurrentView('main');
  };

  const handleCustomThemeClick = () => {
    setSelectedTheme('custom');
    setCurrentView('custom');
  };
  const applyColorPalette = (colorName: ColorName) => {
    // 색상 선택 시 custom 테마로 설정 (다크모드 등에서 전환 시 필요)
    if (selectedTheme !== 'custom') {
      setSelectedTheme('custom');
    }

    const root = document.documentElement;

    // CSS 변수 업데이트
    root.style.setProperty('--bg-primary', getColorValue(colorName, 50));
    root.style.setProperty('--bg-secondary', 'rgb(255 255 255)');
    root.style.setProperty('--text-primary', getColorValue(colorName, 900));
    root.style.setProperty('--text-secondary', getColorValue(colorName, 600));
    root.style.setProperty('--text-muted', getColorValue(colorName, 400));
    root.style.setProperty('--accent-primary', getColorValue(colorName, 500));
    root.style.setProperty('--accent-hover', getColorValue(colorName, 600));
    root.style.setProperty('--border-color', getColorValue(colorName, 300));
    root.style.setProperty('--nav-bg', 'rgb(255 255 255)');
    root.style.setProperty('--button-hover-bg', getColorValue(colorName, 100));

    setSelectedColor(colorName);

    // localStorage에 선택된 색상 저장
    localStorage.setItem('customThemeColor', colorName);
  };

  const renderMainView = () => (
    <>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          설정
        </h2>
        <button
          onClick={handleClose}
          className="rounded-full p-2 transition-colors"
          style={{
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 설정 메뉴 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setCurrentView('theme')}
          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 p-6 transition-all hover:scale-105"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--accent-primary)' }}
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
          <span
            className="font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            테마 설정
          </span>
        </button>

        <button
          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 p-6 transition-all hover:scale-105"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--accent-primary)' }}
          >
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
          <span
            className="font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            메뉴 편집
          </span>
        </button>
      </div>
    </>
  );

  const renderThemeView = () => (
    <>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('main')}
          className="rounded-full p-2 transition-colors"
          style={{
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          테마 설정
        </h2>
        <button
          onClick={handleClose}
          className="rounded-full p-2 transition-colors"
          style={{
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 테마 옵션 */}
      <div className="mb-4 space-y-2">
        {themes.map((themeOption) => (
          <button
            key={themeOption.value}
            onClick={() => {
              if (themeOption.value === 'custom') {
                handleCustomThemeClick();
              } else {
                setSelectedTheme(themeOption.value);
              }
            }}
            className="w-full rounded-lg border-2 p-4 text-left transition-all"
            style={{
              borderColor:
                selectedTheme === themeOption.value
                  ? 'var(--accent-primary)'
                  : 'var(--border-color)',
              backgroundColor:
                selectedTheme === themeOption.value
                  ? 'var(--button-hover-bg)'
                  : 'transparent',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {themeOption.label}
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {themeOption.description}
                </div>
              </div>
              {themeOption.value === 'custom' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              ) : selectedTheme === themeOption.value ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {/* 적용 버튼 */}
      <button
        onClick={handleApplyTheme}
        className="w-full rounded-lg py-3 font-semibold text-white transition-all hover:opacity-90"
        style={{
          backgroundColor: 'var(--accent-primary)',
        }}
      >
        적용
      </button>
    </>
  );

  const renderCustomView = () => (
    <>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('theme')}
          className="rounded-full p-2 transition-colors"
          style={{
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          개인 설정
        </h2>
        <button
          onClick={handleClose}
          className="rounded-full p-2 transition-colors"
          style={{
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 탭 선택 */}
      <div
        className="mb-6 flex gap-2 rounded-lg p-1"
        style={{ backgroundColor: 'var(--button-hover-bg)' }}
      >
        <button
          onClick={() => setCustomTab('auto')}
          className="flex-1 rounded-md py-2 font-medium transition-all"
          style={{
            backgroundColor:
              customTab === 'auto' ? 'var(--bg-secondary)' : 'transparent',
            color:
              customTab === 'auto'
                ? 'var(--text-primary)'
                : 'var(--text-muted)',
          }}
        >
          자동
        </button>
        <button
          onClick={() => setCustomTab('manual')}
          className="flex-1 rounded-md py-2 font-medium transition-all"
          style={{
            backgroundColor:
              customTab === 'manual' ? 'var(--bg-secondary)' : 'transparent',
            color:
              customTab === 'manual'
                ? 'var(--text-primary)'
                : 'var(--text-muted)',
          }}
        >
          수동
        </button>
      </div>

      {/* 자동 탭 콘텐츠 */}
      {customTab === 'auto' && (
        <div className="mb-4">
          <p
            className="mb-4 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            원하는 색상을 선택하면 자동으로 테마가 생성됩니다
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                'rose',
                'orange',
                'yellow',
                'lime',
                'emerald',
                'indigo',
                'purple',
                'pink',
                'slate',
              ] as ColorName[]
            ).map((colorName) => {
              return (
                <button
                  key={colorName}
                  onClick={() => applyColorPalette(colorName)}
                  className="flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:scale-105"
                  style={{
                    borderColor:
                      selectedColor === colorName
                        ? 'var(--accent-primary)'
                        : 'var(--border-color)',
                  }}
                >
                  <div
                    className="h-12 w-12 rounded-full shadow-md"
                    style={{ backgroundColor: `var(--color-${colorName}-500)` }}
                  />
                  <span
                    className="text-xs font-medium capitalize"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {colorName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 수동 탭 콘텐츠 */}
      {customTab === 'manual' && (
        <div className="mb-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            수동 설정 기능은 곧 추가될 예정입니다
          </p>
        </div>
      )}

      {/* 적용 버튼 */}
      <button
        onClick={() => {
          setTheme('custom');
          setCurrentView('theme');
        }}
        className="w-full rounded-lg py-3 font-semibold text-white transition-all hover:opacity-90"
        style={{
          backgroundColor: 'var(--accent-primary)',
        }}
      >
        적용
      </button>
    </>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-lg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
        }}
      >
        {currentView === 'main' && renderMainView()}
        {currentView === 'theme' && renderThemeView()}
        {currentView === 'custom' && renderCustomView()}
      </div>
    </div>
  );
}

export default SettingsModal;
