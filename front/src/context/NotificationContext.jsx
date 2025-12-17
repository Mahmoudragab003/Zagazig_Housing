/**
 * سياق الإشعارات (Notification Context)
 * إدارة الإشعارات الفورية عبر Socket.io
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_URL, SOCKET_URL } from '../config';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user, token, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);

    // جلب الإشعارات
    const fetchNotifications = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/notifications?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data.notifications);
                setUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
        setLoading(false);
    }, [token]);

    // جلب عدد غير المقروء فقط
    const fetchUnreadCount = useCallback(async () => {
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/notifications/unread-count`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUnreadCount(data.data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [token]);

    // تحديد إشعار كمقروء
    const markAsRead = useCallback(async (notificationId) => {
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(prev =>
                    prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, [token]);

    // تحديد الكل كمقروء
    const markAllAsRead = useCallback(async () => {
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, [token]);

    // حذف إشعار
    const deleteNotification = useCallback(async (notificationId) => {
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const notification = notifications.find(n => n._id === notificationId);
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
                if (notification && !notification.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, [token, notifications]);

    // إعداد Socket.io
    useEffect(() => {
        if (!isAuthenticated() || !user?.id) return;

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            newSocket.emit('join_room', user.id);
        });

        // استقبال إشعار جديد
        newSocket.on('new_notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // إظهار إشعار المتصفح إذا كان مدعومًا
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: '/favicon.ico'
                });
            }
        });

        setSocket(newSocket);

        // جلب الإشعارات عند الاتصال
        fetchNotifications();

        return () => {
            newSocket.close();
        };
    }, [user?.id, isAuthenticated]);

    // طلب إذن الإشعارات
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
