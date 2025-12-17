/**
 * صفحة تسجيل الدخول
 * تستخدم من قبل جميع أنواع المستخدمين (طالب - مالك - مدير)
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Building2,
    GraduationCap,
    Shield,
    Loader2
} from 'lucide-react';

const Login = () => {
    // حالة النموذج
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // الهوكس
    const { login } = useAuth();
    const navigate = useNavigate();

    /**
     * معالجة إرسال النموذج
     */
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        // محاولة تسجيل الدخول
        const result = await login(email, password);

        if (result.success) {
            // التوجيه حسب نوع المستخدم
            redirectUserByRole(result.user.role);
        } else {
            setErrorMessage(result.error);
        }

        setIsLoading(false);
    };

    /**
     * توجيه المستخدم لصفحته حسب دوره
     */
    const redirectUserByRole = (role) => {
        switch (role) {
            case 'admin':
                navigate('/admin');
                break;
            case 'vendor':
                navigate('/vendor');
                break;
            default:
                navigate('/');
        }
    };

    /**
     * تسجيل دخول سريع للاختبار
     * (يمكن حذف هذه الدالة في النسخة النهائية)
     */
    const handleQuickLogin = async (testEmail, testPassword) => {
        setEmail(testEmail);
        setPassword(testPassword);
        setIsLoading(true);

        const result = await login(testEmail, testPassword);

        if (result.success) {
            redirectUserByRole(result.user.role);
        } else {
            setErrorMessage(result.error);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">

            {/* خلفية متحركة */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
            </div>

            <div className="relative w-full max-w-md">

                {/* الشعار والعنوان */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30 mb-4">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        سكن طلاب الزقازيق
                    </h1>
                    <p className="text-gray-400">
                        منصة البحث عن السكن للطلاب
                    </p>
                </div>

                {/* كارد تسجيل الدخول */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                    <h2 className="text-2xl font-semibold text-white text-center mb-6">
                        تسجيل الدخول
                    </h2>

                    {/* رسالة الخطأ */}
                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
                            {errorMessage}
                        </div>
                    )}

                    {/* نموذج تسجيل الدخول */}
                    <form onSubmit={handleFormSubmit} className="space-y-5">

                        {/* حقل البريد الإلكتروني */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* حقل كلمة المرور */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* تذكرني ونسيت كلمة المرور */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-500 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                                />
                                <span className="mr-2">تذكرني</span>
                            </label>
                            <a
                                href="#"
                                className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                نسيت كلمة المرور؟
                            </a>
                        </div>

                        {/* زر الدخول */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    جاري تسجيل الدخول...
                                </>
                            ) : (
                                'تسجيل الدخول'
                            )}
                        </button>
                    </form>

                    {/* الفاصل */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-white/20" />
                        <span className="px-4 text-gray-400 text-sm">أو</span>
                        <div className="flex-1 border-t border-white/20" />
                    </div>

                    {/* رابط إنشاء حساب */}
                    <p className="text-center text-gray-400 mt-6">
                        ليس لديك حساب؟{' '}
                        <Link
                            to="/register"
                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        >
                            إنشاء حساب جديد
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    &copy; 2025 سكن طلاب الزقازيق - جميع الحقوق محفوظة
                </p>
            </div>
        </div>
    );
};

export default Login;
