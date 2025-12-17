/**
 * مكون التقييمات (Reviews)
 * عرض وإضافة تقييمات للإعلانات
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, User, Loader2, Send } from 'lucide-react';
import { API_URL } from '../config';

const Reviews = ({ listingId }) => {
    const { token, isAuthenticated, user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // نموذج التقييم الجديد
    const [showForm, setShowForm] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchReviews();
    }, [listingId]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`${API_URL}/reviews/listing/${listingId}`);
            const data = await response.json();

            if (data.success) {
                setReviews(data.data.reviews);
                setAvgRating(data.data.avgRating);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    listing: listingId,
                    rating: newRating,
                    comment: newComment
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'تم إضافة تقييمك بنجاح! سيظهر بعد موافقة المدير' });
                setNewComment('');
                setNewRating(5);
                setShowForm(false);
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'خطأ في إرسال التقييم' });
        }

        setIsSubmitting(false);
    };

    // مكون النجوم
    const StarRating = ({ rating, interactive = false, onRate }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type={interactive ? 'button' : undefined}
                    onClick={() => interactive && onRate?.(star)}
                    className={interactive ? 'cursor-pointer' : 'cursor-default'}
                >
                    <Star
                        className={`w-5 h-5 ${star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                            }`}
                    />
                </button>
            ))}
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            {/* العنوان والمتوسط */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">التقييمات</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={Math.round(avgRating)} />
                        <span className="text-gray-500 text-sm">
                            ({avgRating} من 5) - {reviews.length} تقييم
                        </span>
                    </div>
                </div>

                {isAuthenticated() && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                        أضف تقييمك
                    </button>
                )}
            </div>

            {/* رسالة النجاح/الخطأ */}
            {message.text && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* نموذج التقييم */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-800 mb-3">أضف تقييمك</h3>

                    <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-2">التقييم</label>
                        <StarRating
                            rating={newRating}
                            interactive
                            onRate={setNewRating}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-2">التعليق (اختياري)</label>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="شاركنا تجربتك..."
                            rows={3}
                            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            إرسال
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            )}

            {/* قائمة التقييمات */}
            {reviews.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                    لا توجد تقييمات بعد
                </p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-800">
                                            {review.user?.firstName} {review.user?.lastName}
                                        </span>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-600 text-sm mt-1">
                                            {review.comment}
                                        </p>
                                    )}
                                    <span className="text-gray-400 text-xs mt-1 block">
                                        {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reviews;
