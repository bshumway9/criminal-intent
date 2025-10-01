import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme, ThemeProvider as NavigationThemeProvider, Theme } from '@react-navigation/native';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type AppTheme = {
    key: string;
    label: string;
    mode: 'light' | 'dark';
    colors: {
        text: string;
        background: string;
        tint: string;
        icon: string;
        tabIconDefault: string;
        tabIconSelected: string;
    };
};

const THEMES: AppTheme[] = [
    {
        key: 'classicLight',
        label: 'Classic Light',
        mode: 'light',
        colors: {
            text: '#11181C',
            background: '#ffffff',
            tint: '#0a7ea4',
            icon: '#687076',
            tabIconDefault: '#687076',
            tabIconSelected: '#0a7ea4',
        },
    },
    {
        key: 'warmLight',
        label: 'Warm Light',
        mode: 'light',
        colors: {
            text: '#2d241f',
            background: '#f9f5f2',
            tint: '#c97b32',
            icon: '#7d5d4a',
            tabIconDefault: '#7d5d4a',
            tabIconSelected: '#c97b32',
        },
    },
    {
        key: 'coolLight',
        label: 'Cool Light',
        mode: 'light',
        colors: {
            text: '#102027',
            background: '#eef7fa',
            tint: '#1b6f9b',
            icon: '#54717d',
            tabIconDefault: '#54717d',
            tabIconSelected: '#1b6f9b',
        },
    },
    {
        key: 'classicDark',
        label: 'Classic Dark',
        mode: 'dark',
        colors: {
            text: '#ECEDEE',
            background: '#151718',
            tint: '#ffffff',
            icon: '#9BA1A6',
            tabIconDefault: '#9BA1A6',
            tabIconSelected: '#ffffff',
        },
    },
    {
        key: 'amethystDark',
        label: 'Amethyst Dark',
        mode: 'dark',
        colors: {
            text: '#f0eaff',
            background: '#1b1324',
            tint: '#b383ff',
            icon: '#9f82c6',
            tabIconDefault: '#9f82c6',
            tabIconSelected: '#b383ff',
        },
    },
    {
        key: 'midnightDark',
        label: 'Midnight Dark',
        mode: 'dark',
        colors: {
            text: '#dfe7ec',
            background: '#0d141a',
            tint: '#4da3ff',
            icon: '#5c707d',
            tabIconDefault: '#5c707d',
            tabIconSelected: '#4da3ff',
        },
    },
];

interface ThemeContextValue {
    theme: AppTheme;
    setThemeKey: (key: string) => void;
    themes: AppTheme[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'app.themeKey.v1';

export const ThemeProviderCustom = ({ children }: { children: ReactNode }) => {
    const [themeKey, setThemeKey] = useState('classicLight');
    const [hydrated, setHydrated] = useState(false);
    const isSettingRef = useRef(false);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored && THEMES.some(t => t.key === stored) && active) {
                    setThemeKey(stored);
                }
            } catch (e) {
                // ignore read errors; fall back to default
                console.warn('Theme load failed', e);
            } finally {
                if (active) setHydrated(true);
            }
        })();
        return () => { active = false; };
    }, []);

    const persistTheme = useCallback(async (key: string) => {
        try {
            isSettingRef.current = true;
            await AsyncStorage.setItem(STORAGE_KEY, key);
        } catch (e) {
            console.warn('Theme save failed', e);
        } finally {
            isSettingRef.current = false;
        }
    }, []);

    const setThemeKeyPersist = useCallback((key: string) => {
        setThemeKey(key);
        persistTheme(key);
    }, [persistTheme]);

    const theme = useMemo(() => THEMES.find(t => t.key === themeKey) || THEMES[0], [themeKey]);

    // Build a navigation theme derived from custom theme to keep a single source of truth
    const navigationTheme: Theme = useMemo(() => {
        const base = theme.mode === 'dark' ? NavDarkTheme : NavDefaultTheme;
        return {
            ...base,
            dark: theme.mode === 'dark',
            colors: {
                ...base.colors,
                background: theme.colors.background,
                card: theme.colors.background,
                text: theme.colors.text,
                primary: theme.colors.tint,
                border: base.colors.border,
                notification: theme.colors.tint,
            },
        };
    }, [theme]);

    const value = useMemo(() => ({ theme, setThemeKey: setThemeKeyPersist, themes: THEMES }), [theme, setThemeKeyPersist]);
    return (
        <ThemeContext.Provider value={value}>
            <NavigationThemeProvider value={navigationTheme}>
                {hydrated ? children : null}
            </NavigationThemeProvider>
        </ThemeContext.Provider>
    );
};

export function useAppTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useAppTheme must be used within ThemeProviderCustom');
    return ctx;
}
