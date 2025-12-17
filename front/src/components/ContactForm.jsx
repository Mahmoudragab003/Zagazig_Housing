/**
 * مكون نموذج التواصل (Contact Form)
 * يظهر في صفحة تفاصيل الإعلان للتواصل مع المالك
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Loader2, CheckCircle, X } from 'lucide-react';
import { API_URL } from '../config';

const ContactForm = ({ listingId, vendorId, vendorName, onClose, initialMessage = '' }) => {
    const { token, isAuthenticated } = useAuth();
    const [message, setMessage] = useState(initialMessage);
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            setError('يرجى كتابة رسالة');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver: vendorId,
                    listing: listingId,
                    message: message.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                setIsSent(true);
                setTimeout(() => {
                    onClose?.();
                }, 2000);
            } else {
                setError(data.message || 'فشل إرسال الرسالة');
            }
        } catch (err) {
            setError('خطأ في الاتصال بالخادم');
        }

        setIsLoading(false);
    };

    if (!isAuthenticated()) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-500">يجب تسجيل الدخول للتواصل مع المالك</p>
            </div>
        );
    }

    if (isSent) {
        return (
            <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">تم الإرسال!</h3>
                <p className="text-gray-500">سيتواصل معك المالك قريباً</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                    تواصل مع {vendorName}
                </h3>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا... مثال: مرحباً، أنا مهتم بهذا العقار وأريد معرفة المزيد"
                    rows={4}
                    className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري الإرسال...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            إرسال الرسالة
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
