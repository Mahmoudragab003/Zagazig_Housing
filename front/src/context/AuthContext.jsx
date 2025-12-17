/**
 * سياق المصادقة (Authentication Context)
 * هنا بنتحكم في حالة تسجيل الدخول للمستخدم في كل التطبيق
 * 
 * الوظائف المتاحة:
 * - login: تسجيل الدخول
 * - register: إنشاء حساب جديد
 * - logout: تسجيل الخروج
 * - updateProfile: تحديث بيانات المستخدم
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

// رابط الـ API الخاص بالسيرفر
const API_BASE_URL = API_URL;

// إنشاء السياق
const AuthContext = createContext(null);

/**
 * مزود المصادقة - يغلف التطبيق بالكامل
 */
export const AuthProvider = ({ children }) => {
    // حالة المستخدم الحالي
    const [user, setUser] = useState(null);

    // التوكن المخزن
    const [token, setToken] = useState(() => {
        return localStorage.getItem('authToken');
    });

    // حالة التحميل
    const [loading, setLoading] = useState(true);

    // رسالة الخطأ
    const [error, setError] = useState(null);

    /**
     * التحقق من تسجيل الدخول عند فتح التطبيق
     */
    useEffect(() => {
        const checkAuthStatus = async () => {
            const savedToken = localStorage.getItem('authToken');

            if (!savedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${savedToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.data.user);
                    setToken(savedToken);
                } else {
                    // التوكن منتهي أو غير صالح
                    localStorage.removeItem('authToken');
                    setToken(null);
                    setUser(null);
                }
            } catch (err) {
                console.error('خطأ في التحقق من المصادقة:', err);
                localStorage.removeItem('authToken');
                setToken(null);
            }

            setLoading(false);
        };

        checkAuthStatus();
    }, []);

    /**
     * تسجيل الدخول
     * @param {string} email - البريد الإلكتروني
     * @param {string} password - كلمة المرور
     */
    const login = async (email, password) => {
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل تسجيل الدخول');
            }

            // حفظ التوكن والمستخدم
            localStorage.setItem('authToken', data.data.token);
            setToken(data.data.token);
            setUser(data.data.user);

            return {
                success: true,
                user: data.data.user
            };

        } catch (err) {
            setError(err.message);
            return {
                success: false,
                error: err.message
            };
        }
    };

    /**
     * إنشاء حساب جديد
     * @param {Object} userData - بيانات المستخدم الجديد
     */
    const register = async (userData) => {
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل إنشاء الحساب');
            }

            // حفظ التوكن والمستخدم
            localStorage.setItem('authToken', data.data.token);
            setToken(data.data.token);
            setUser(data.data.user);

            return {
                success: true,
                user: data.data.user
            };

        } catch (err) {
            setError(err.message);
            return {
                success: false,
                error: err.message
            };
        }
    };

    /**
     * تسجيل الخروج
     */
    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setError(null);
    };

    /**
     * تحديث بيانات المستخدم
     * @param {Object} profileData - البيانات الجديدة
     */
    const updateProfile = async (profileData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل التحديث');
            }

            setUser(data.data.user);
            return { success: true };

        } catch (err) {
            return {
                success: false,
                error: err.message
            };
        }
    };

    // دوال التحقق من الصلاحيات
    const isAdmin = () => user?.role === 'admin';
    const isVendor = () => user?.role === 'vendor' || user?.role === 'admin';
    const isStudent = () => user?.role === 'student';
    const isAuthenticated = () => !!user && !!token;

    // القيم المتاحة للمكونات الفرعية
    const contextValue = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
        isVendor,
        isStudent,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * هوك مخصص لاستخدام سياق المصادقة
 * بيسهل الوصول لكل دوال وبيانات المصادقة
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth لازم يتستخدم جوا AuthProvider');
    }

    return context;
};

export default AuthContext;
