/**
 * صفحة التسجيل (إنشاء حساب جديد)
 * تدعم نوعين من المستخدمين: طالب ومالك عقار
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Phone,
    Building2,
    GraduationCap,
    Loader2,
    BookOpen
} from 'lucide-react';

const Register = () => {
    // بيانات النموذج
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'student',
        // حقول الطالب
        studentId: '',
        faculty: '',
        // حقول المالك
        companyName: ''
    });

    // حالة النموذج
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    /**
     * تحديث قيمة حقل في النموذج
     */
    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    /**
     * التحقق من صحة البيانات
     */
    const validateForm = () => {
        // التحقق من تطابق كلمات المرور
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('كلمات المرور غير متطابقة');
            return false;
        }

        // التحقق من طول كلمة المرور
        if (formData.password.length < 6) {
            setErrorMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return false;
        }

        return true;
    };

    /**
     * معالجة إرسال النموذج
     */
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        // التحقق من صحة البيانات
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        // تجهيز البيانات للإرسال
        const userData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            role: formData.role
        };

        // إضافة الحقول حسب نوع المستخدم
        if (formData.role === 'student') {
            userData.studentId = formData.studentId;
            userData.faculty = formData.faculty;
        } else if (formData.role === 'vendor') {
            userData.companyName = formData.companyName;
        }

        // محاولة التسجيل
        const result = await register(userData);

        if (result.success) {
            // التوجيه حسب نوع المستخدم
            if (formData.role === 'vendor') {
                navigate('/vendor');
            } else {
                navigate('/');
            }
        } else {
            setErrorMessage(result.error);
        }

        setIsLoading(false);
    };

    /**
     * تحديد أيقونة نوع المستخدم
     */
    const getRoleIcon = (role) => {
        return role === 'student' ? GraduationCap : Building2;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">

            {/* خلفية متحركة */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
            </div>

            <div className="relative w-full max-w-md">

                {/* الشعار والعنوان */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30 mb-4">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        إنشاء حساب جديد
                    </h1>
                    <p className="text-gray-400">
                        انضم إلى منصة سكن طلاب الزقازيق
                    </p>
                </div>

                {/* كارد التسجيل */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">

                    {/* رسالة الخطأ */}
                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
                            {errorMessage}
                        </div>
                    )}

                    {/* اختيار نوع الحساب */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            نوع الحساب
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {/* خيار الطالب */}
                            <button
                                type="button"
                                onClick={() => handleInputChange('role', 'student')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${formData.role === 'student'
                                    ? 'border-green-500 bg-green-500/20 text-green-300'
                                    : 'border-white/20 text-gray-400 hover:border-white/40'
                                    }`}
                            >
                                <GraduationCap className="w-6 h-6" />
                                <span className="text-sm font-medium">طالب</span>
                            </button>

                            {/* خيار المالك */}
                            <button
                                type="button"
                                onClick={() => handleInputChange('role', 'vendor')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${formData.role === 'vendor'
                                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                                    : 'border-white/20 text-gray-400 hover:border-white/40'
                                    }`}
                            >
                                <Building2 className="w-6 h-6" />
                                <span className="text-sm font-medium">مالك عقار</span>
                            </button>
                        </div>
                    </div>

                    {/* نموذج التسجيل */}
                    <form onSubmit={handleFormSubmit} className="space-y-4">

                        {/* الاسم الأول والأخير */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    الاسم الأول
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        placeholder="محمد"
                                        required
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    الاسم الأخير
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    placeholder="أحمد"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* البريد الإلكتروني */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="example@email.com"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* رقم الهاتف */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                رقم الهاتف
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="01xxxxxxxxx"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* حقول الطالب */}
                        {formData.role === 'student' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        الرقم الجامعي
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.studentId}
                                        onChange={(e) => handleInputChange('studentId', e.target.value)}
                                        placeholder="123456"
                                        required
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        الكلية
                                    </label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.faculty}
                                            onChange={(e) => handleInputChange('faculty', e.target.value)}
                                            placeholder="الهندسة"
                                            required
                                            className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* حقول المالك */}
                        {formData.role === 'vendor' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    اسم الشركة (اختياري)
                                </label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    placeholder="شركة العقارات"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        )}

                        {/* كلمة المرور */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* تأكيد كلمة المرور */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                تأكيد كلمة المرور
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        {/* زر التسجيل */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    جاري إنشاء الحساب...
                                </>
                            ) : (
                                'إنشاء الحساب'
                            )}
                        </button>
                    </form>

                    {/* رابط تسجيل الدخول */}
                    <p className="text-center text-gray-400 mt-6">
                        لديك حساب بالفعل؟{' '}
                        <Link
                            to="/login"
                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        >
                            تسجيل الدخول
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

export default Register;
