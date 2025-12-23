import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'default';
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const storedTheme = localStorage.getItem('theme') || 'default';
            setTheme(storedTheme);
        };

        // Listen for storage changes in other tabs
        window.addEventListener('storage', handleStorageChange);

        // Also a custom event if we want to sync within the same window more reliably
        window.addEventListener('themeChange', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('themeChange', handleStorageChange);
        };
    }, []);

    const updateTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        window.dispatchEvent(new Event('themeChange'));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
