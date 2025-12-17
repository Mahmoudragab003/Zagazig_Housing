/**
 * صفحة نسيت كلمة السر
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (data.success) {
                setSent(true);
                setMessage({ type: 'success', text: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' });
            } else {
                setMessage({ type: 'error', text: data.message || 'حدث خطأ' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">نسيت كلمة المرور؟</h1>
                    <p className="text-gray-400 mt-2">أدخل بريدك الإلكتروني لاستعادة حسابك</p>
                </div>

                {/* Form */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    {sent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">تم الإرسال!</h3>
                            <p className="text-gray-400 mb-6">
                                تفقد بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور
                            </p>
                            <Link to="/login" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300">
                                <ArrowRight className="w-4 h-4" />
                                العودة لتسجيل الدخول
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {message.text && (
                                <div className={`p-3 rounded-xl text-sm ${message.type === 'error'
                                    ? 'bg-red-500/20 border border-red-500/50 text-red-200'
                                    : 'bg-green-500/20 border border-green-500/50 text-green-200'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-300 text-sm mb-2">البريد الإلكتروني</label>
                                <div className="relative">
                                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="example@email.com"
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    'إرسال رابط الاستعادة'
                                )}
                            </button>

                            <div className="text-center">
                                <Link to="/login" className="text-purple-400 hover:text-purple-300 text-sm flex items-center justify-center gap-2">
                                    <ArrowRight className="w-4 h-4" />
                                    العودة لتسجيل الدخول
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
