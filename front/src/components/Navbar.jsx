/**
 * شريط التنقل الرئيسي (Navbar)
 * يظهر في جميع صفحات التطبيق
 * يتغير حسب حالة المستخدم (مسجل دخول / زائر)
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import {
    Building2,
    LogOut,
    User,
    Heart,
    Search,
    Menu,
    X,
    Home,
    Shield,
    Store,
    MessageCircle,
    Moon,
    Sun,
    Bell
} from 'lucide-react';

const Navbar = () => {
    // حالة القائمة في الموبايل
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // الوضع الليلي من ThemeContext
    const { isDarkMode, toggleTheme } = useTheme();

    // بيانات المصادقة
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    /**
     * تسجيل الخروج وإعادة التوجيه
     */
    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    /**
     * إغلاق القائمة عند النقر على رابط
     */
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50 transition-colors">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">

                    {/* الشعار */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-800 hidden sm:block">
                            سكن الزقازيق
                        </span>
                    </Link>

                    {/* روابط التنقل - سطح المكتب */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className="text-gray-600 hover:text-purple-600 flex items-center gap-1"
                        >
                            <Home className="w-4 h-4" />
                            الرئيسية
                        </Link>
                        <Link
                            to="/search"
                            className="text-gray-600 hover:text-purple-600 flex items-center gap-1"
                        >
                            <Search className="w-4 h-4" />
                            البحث
                        </Link>
                        {isAuthenticated() && (
                            <>
                                <Link
                                    to="/favorites"
                                    className="text-gray-600 hover:text-purple-600 flex items-center gap-1"
                                >
                                    <Heart className="w-4 h-4" />
                                    المفضلة
                                </Link>
                                <Link
                                    to="/messages"
                                    className="text-gray-600 hover:text-purple-600 flex items-center gap-1"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    الرسائل
                                </Link>
                            </>
                        )}
                    </div>

                    {/* أزرار المستخدم - سطح المكتب */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated() ? (
                            <>
                                {/* رابط لوحة التحكم للمدير */}
                                {user?.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-1"
                                    >
                                        <Shield className="w-4 h-4" />
                                        لوحة التحكم
                                    </Link>
                                )}

                                {/* رابط إعلاناتي للمالك */}
                                {user?.role === 'vendor' && (
                                    <Link
                                        to="/vendor"
                                        className="text-amber-600 hover:bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-1"
                                    >
                                        <Store className="w-4 h-4" />
                                        إعلاناتي
                                    </Link>
                                )}

                                {/* رابط الملف الشخصي */}
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {user?.firstName?.[0]}
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-200">{user?.firstName}</span>
                                </Link>

                                {/* زر الإشعارات */}
                                <NotificationDropdown />

                                {/* زر الوضع الليلي */}
                                <button
                                    onClick={toggleTheme}
                                    className="text-gray-500 hover:text-purple-500 p-2"
                                    title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
                                >
                                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>

                                {/* زر تسجيل الخروج */}
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-500 hover:text-red-500 p-2"
                                    title="تسجيل الخروج"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-600 dark:text-gray-300 hover:text-purple-600"
                                >
                                    تسجيل الدخول
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
                                >
                                    إنشاء حساب
                                </Link>
                                {/* زر الوضع الليلي */}
                                <button
                                    onClick={toggleTheme}
                                    className="text-gray-500 hover:text-purple-500 p-2"
                                    title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
                                >
                                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>
                            </>
                        )}
                    </div>

                    {/* زر القائمة - موبايل */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* قائمة الموبايل */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/"
                                onClick={closeMobileMenu}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                الرئيسية
                            </Link>
                            <Link
                                to="/search"
                                onClick={closeMobileMenu}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                البحث
                            </Link>

                            {isAuthenticated() ? (
                                <>
                                    <Link
                                        to="/favorites"
                                        onClick={closeMobileMenu}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        المفضلة
                                    </Link>
                                    <Link
                                        to="/messages"
                                        onClick={closeMobileMenu}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        الرسائل
                                    </Link>
                                    <Link
                                        to="/profile"
                                        onClick={closeMobileMenu}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        حسابي
                                    </Link>

                                    {user?.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            onClick={closeMobileMenu}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            لوحة التحكم
                                        </Link>
                                    )}

                                    {user?.role === 'vendor' && (
                                        <Link
                                            to="/vendor"
                                            onClick={closeMobileMenu}
                                            className="px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                                        >
                                            إعلاناتي
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-red-500 text-right hover:bg-red-50 rounded-lg"
                                    >
                                        تسجيل الخروج
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={closeMobileMenu}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeMobileMenu}
                                        className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                    >
                                        إنشاء حساب
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav >
    );
};

export default Navbar;
