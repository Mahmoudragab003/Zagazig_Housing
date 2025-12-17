
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
    Bell,
    Check,
    CheckCheck,
    X,
    MessageCircle,
    Star,
    Home,
    AlertCircle,
    Loader2,
    Trash2
} from 'lucide-react';

const NotificationDropdown = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications
    } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // جلب الإشعارات عند فتح القائمة
    const handleToggle = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    // الحصول على أيقونة حسب نوع الإشعار
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'message':
                return <MessageCircle className="w-5 h-5 text-blue-500" />;
            case 'review':
                return <Star className="w-5 h-5 text-yellow-500" />;
            case 'listing_match':
                return <Home className="w-5 h-5 text-green-500" />;
            case 'listing_approved':
                return <Check className="w-5 h-5 text-green-500" />;
            case 'listing_rejected':
                return <X className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    // معالجة النقر على إشعار
    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }

        // التنقل حسب نوع الإشعار
        if (notification.data?.link) {
            navigate(notification.data.link);
        } else if (notification.data?.listingId) {
            navigate(`/listings/${notification.data.listingId}`);
        } else if (notification.type === 'message') {
            navigate('/messages');
        }

        setIsOpen(false);
    };

    // تنسيق الوقت
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;
        return date.toLocaleDateString('ar-EG');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* زر الجرس */}
            <button
                onClick={handleToggle}
                className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                aria-label="الإشعارات"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* القائمة المنسدلة */}
            {isOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50" dir="rtl">
                    {/* رأس القائمة */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-white" />
                            <h3 className="text-white font-bold">الإشعارات</h3>
                            {unreadCount > 0 && (
                                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                                    {unreadCount} جديد
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-white/80 hover:text-white text-sm flex items-center gap-1"
                            >
                                <CheckCheck className="w-4 h-4" />
                                قراءة الكل
                            </button>
                        )}
                    </div>

                    {/* قائمة الإشعارات */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>لا توجد إشعارات</p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${!notification.isRead ? 'bg-purple-50/50' : ''
                                        }`}
                                >
                                    {/* أيقونة الإشعار */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* محتوى الإشعار */}
                                    <div
                                        className="flex-1 min-w-0"
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''} text-gray-800`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* أزرار الإجراءات */}
                                    <div className="flex-shrink-0 flex flex-col gap-1">
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification._id);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* رابط عرض الكل */}
                    {notifications.length > 0 && (
                        <div className="p-3 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    navigate('/notifications');
                                    setIsOpen(false);
                                }}
                                className="w-full text-center text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                                عرض جميع الإشعارات
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
