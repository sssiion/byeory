import { useState, useEffect } from 'react';
import { updateHeaderSettings, getHeaderSettings, type HeaderSettings } from '../services/headerSettings';

const LOCAL_STORAGE_KEY = 'header_settings_v3';

const DEFAULT_SETTINGS: HeaderSettings = {
    showTimer: false,
    showCredit: true,
    showWidgetZoom: false,
};

export const useHeaderSettings = () => {
    // 1. Initialize from Local Storage (Instant Load)
    const [settings, setSettings] = useState<HeaderSettings>(() => {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        return cached ? { ...DEFAULT_SETTINGS, ...JSON.parse(cached) } : DEFAULT_SETTINGS;
    });

    // 2. Sync with Backend on Mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const serverSettings = await getHeaderSettings();

                if (serverSettings) {
                    setSettings(serverSettings);
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverSettings));
                }
            } catch (error) {
                console.error("Failed to sync header settings:", error);
            }
        };

        fetchSettings();

        // Listen for local changes (from other components)
        const handleLocalChange = (e: CustomEvent) => {
            setSettings(e.detail);
        };
        window.addEventListener('header-settings-change', handleLocalChange as EventListener);
        return () => window.removeEventListener('header-settings-change', handleLocalChange as EventListener);
    }, []);

    // 3. Update Function
    const updateSettings = async (newSettings: Partial<HeaderSettings>) => {
        const updated = { ...settings, ...newSettings };

        // Optimistic Update
        setSettings(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

        // Update Backend
        try {
            await updateHeaderSettings(updated);
        } catch (error) {
            console.error("Failed to update header settings:", error);
        }

        // Dispatch event for other components (like Navigation)
        window.dispatchEvent(new CustomEvent('header-settings-change', { detail: updated }));
    };

    return { settings, updateSettings };
};
