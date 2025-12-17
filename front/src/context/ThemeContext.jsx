/**
 * سياق الثيم (Theme Context)
 * للتحكم في الوضع الليلي/النهاري للتطبيق
 */

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    // تحميل الثيم المحفوظ أو استخدام تفضيلات النظام
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // تحديث الـ class على الـ html element
    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // الاستماع لتغييرات تفضيلات النظام
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            // فقط إذا لم يكن المستخدم قد اختار ثيم يدوياً
            if (!localStorage.getItem('theme')) {
                setIsDarkMode(e.matches);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => setIsDarkMode(prev => !prev);
    const setLightMode = () => setIsDarkMode(false);
    const setDarkMode = () => setIsDarkMode(true);

    return (
        <ThemeContext.Provider value={{
            isDarkMode,
            toggleTheme,
            setLightMode,
            setDarkMode
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export default ThemeContext;
