import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'default' | 'light' | 'dark' | 'custom';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // localStorage에서 저장된 테마 불러오기
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'default';
  });

  useEffect(() => {
    // 테마 변경 시 localStorage에 저장하고 document에 적용
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    const root = document.documentElement;

    // custom 테마인 경우 저장된 색상 불러와서 적용
    if (theme === 'custom') {
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
    } else {
      // custom이 아닌 다른 테마로 변경 시 inline style 제거
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
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
