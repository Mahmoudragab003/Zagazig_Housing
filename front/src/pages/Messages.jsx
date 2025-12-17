/**
 * صفحة الرسائل (Messages Page)
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
    MessageCircle,
    Building2,
    Loader2,
    Mail,
    Send,
    Check,
    CheckCheck,
    ArrowRight,
    Trash2,
    X,
    Clock
} from 'lucide-react';

import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config';

const Messages = () => {
    const { user, token, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [deletingConversation, setDeletingConversation] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // التمرير لأسفل عند وصول رسالة جديدة
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        // Initialize Socket
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);

        if (user?.id) {
            newSocket.emit('join_room', user.id);
        }

        // استقبال رسالة جديدة لحظياً (رسائل من الآخرين فقط)
        newSocket.on('new_message', (message) => {
            if (message.sender._id === user?.id) return;

            setMessages((prev) => {
                // تجنب التكرار
                const exists = prev.find(m => m._id === message._id);
                if (exists) return prev;
                return [...prev, message];
            });
            // التمرير لأسفل تلقائياً
            setTimeout(scrollToBottom, 100);
        });

        // رسالة تم إرسالها بنجاح (للمرسل) - تجاهلها لأننا نستخدم API response
        newSocket.on('message_sent', (message) => {
            // لا نحتاج لهذا الحدث لأننا نستخدم الـ API response مباشرة
            // هذا يمنع ظهور الرسالة مرتين
        });

        fetchMessages();

        return () => newSocket.close();
    }, [user]);

    // التمرير لأسفل عند تغيير المحادثة
    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation]);

    // التعامل مع معلمات URL للرد
    useEffect(() => {
        const replyUserId = searchParams.get('reply');
        if (replyUserId && messages.length > 0) {
            const conv = Object.values(groupedMessages).find(c => c.id === replyUserId);
            if (conv) {
                setSelectedConversation(conv);
            }
        }
    }, [searchParams, messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_URL}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // ترتيب الرسائل من الأقدم للأحدث
                const sortedMessages = data.data.messages.sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
                setMessages(sortedMessages);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
        setLoading(false);
    };

    // Track sent message IDs to prevent duplicates from socket
    const sentMessageIds = useRef(new Set());

    // إرسال رسالة جديدة
    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

        setSendingMessage(true);
        const messageText = newMessage.trim();
        setNewMessage(''); // مسح الحقل فوراً للإحساس باللحظية

        // إضافة الرسالة مؤقتاً (Optimistic UI)
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            _id: tempId,
            sender: { _id: user.id, firstName: 'أنت', lastName: '' },
            receiver: { _id: selectedConversation.id },
            listing: selectedConversation.lastMessage?.listing,
            message: messageText,
            createdAt: new Date().toISOString(),
            isRead: false,
            isPending: true
        };
        setMessages(prev => [...prev, tempMessage]);
        setTimeout(scrollToBottom, 100);

        try {
            // الحصول على listingId من أي رسالة في المحادثة
            const conversationMessages = messages.filter(m =>
                m.sender._id === selectedConversation.id || m.receiver._id === selectedConversation.id
            );
            const messageWithListing = conversationMessages.find(m => m.listing);
            const listingId = messageWithListing?.listing?._id || messageWithListing?.listing ||
                selectedConversation.listingId ||
                selectedConversation.lastMessage?.listing?._id;

            if (!listingId) {
                console.error('No listing ID found for this conversation');
                setMessages(prev => prev.filter(m => m._id !== tempId));
                setSendingMessage(false);
                return;
            }

            const res = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver: selectedConversation.id,
                    listing: listingId,
                    message: messageText
                })
            });
            const data = await res.json();
            if (data.success) {
                // Track this message ID to ignore from socket
                sentMessageIds.current.add(data.data.message._id);
                // استبدال الرسالة المؤقتة بالحقيقية
                setMessages(prev => prev.map(m =>
                    m._id === tempId ? data.data.message : m
                ));
            } else {
                // إزالة الرسالة المؤقتة في حالة الخطأ
                setMessages(prev => prev.filter(m => m._id !== tempId));
            }
        } catch (err) {
            console.error('Error sending message:', err);
            // إزالة الرسالة المؤقتة في حالة الخطأ
            setMessages(prev => prev.filter(m => m._id !== tempId));
        }
        setSendingMessage(false);
        inputRef.current?.focus();
    };

    // تجميع الرسائل حسب المحادثة
    const groupedMessages = messages.reduce((groups, msg) => {
        const otherId = msg.sender._id === user?.id ? msg.receiver._id : msg.sender._id;
        const otherName = msg.sender._id === user?.id
            ? `${msg.receiver.firstName || ''} ${msg.receiver.lastName || ''}`.trim()
            : `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim();

        if (!groups[otherId]) {
            groups[otherId] = {
                id: otherId,
                name: otherName || 'مستخدم',
                messages: [],
                lastMessage: null,
                unreadCount: 0,
                listingId: null // حفظ ID الإعلان الأصلي
            };
        }
        groups[otherId].messages.push(msg);
        groups[otherId].lastMessage = msg;

        // حفظ listing ID من أول رسالة تحتوي عليه
        if (!groups[otherId].listingId && msg.listing) {
            groups[otherId].listingId = msg.listing._id || msg.listing;
        }

        if (!msg.isRead && msg.receiver._id === user?.id) {
            groups[otherId].unreadCount++;
        }
        return groups;
    }, {});

    const conversations = Object.values(groupedMessages).sort((a, b) =>
        new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
    );

    // الحصول على رسائل المحادثة المحددة
    const currentMessages = selectedConversation
        ? groupedMessages[selectedConversation.id]?.messages || []
        : [];

    // حذف المحادثة
    const deleteConversation = async () => {
        if (!selectedConversation) return;

        setDeletingConversation(true);
        try {
            const res = await fetch(`${API_URL}/messages/conversation/${selectedConversation.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // حذف الرسائل من الـ state
                setMessages(prev => prev.filter(m =>
                    !(m.sender._id === selectedConversation.id || m.receiver._id === selectedConversation.id)
                ));
                setSelectedConversation(null);
                setShowDeleteConfirm(false);
            }
        } catch (err) {
            console.error('Error deleting conversation:', err);
        }
        setDeletingConversation(false);
    };

    // تنسيق الوقت
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        const today = new Date();
        const msgDate = new Date(date);

        if (msgDate.toDateString() === today.toDateString()) {
            return 'اليوم';
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (msgDate.toDateString() === yesterday.toDateString()) {
            return 'أمس';
        }

        return msgDate.toLocaleDateString('ar-EG');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100" dir="rtl">
            <Navbar />

            <main className="container mx-auto px-4 py-4">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
                    <div className="flex h-full">

                        {/* قائمة المحادثات - الجانب الأيمن */}
                        <div className={`w-full md:w-1/3 border-l border-gray-200 flex flex-col bg-white ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                            {/* رأس قائمة المحادثات */}
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-white font-bold text-lg">الرسائل</h1>
                                        <p className="text-white/70 text-xs">{conversations.length} محادثة</p>
                                    </div>
                                </div>
                            </div>

                            {/* قائمة المحادثات */}
                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                        <Mail className="w-16 h-16 text-gray-300 mb-4" />
                                        <h3 className="text-gray-500 font-medium">لا توجد محادثات</h3>
                                        <p className="text-gray-400 text-sm mt-1">ستظهر هنا عندما يتواصل معك أحد</p>
                                    </div>
                                ) : (
                                    conversations.map((conv) => (
                                        <div
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv)}
                                            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedConversation?.id === conv.id ? 'bg-purple-50' : ''
                                                }`}
                                        >
                                            {/* صورة المستخدم */}
                                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {conv.name.charAt(0)}
                                            </div>

                                            {/* معلومات المحادثة */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-semibold text-gray-800 truncate">{conv.name}</h3>
                                                    <span className="text-xs text-gray-400">
                                                        {formatTime(conv.lastMessage?.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {conv.lastMessage?.sender._id === user?.id && (
                                                            <span className="text-gray-400">أنت: </span>
                                                        )}
                                                        {conv.lastMessage?.message}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* منطقة المحادثة - الجانب الأيسر */}
                        <div className={`flex-1 flex flex-col bg-gray-50 ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                            {selectedConversation ? (
                                <>
                                    {/* رأس المحادثة */}
                                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedConversation(null)}
                                            className="md:hidden text-white p-1"
                                        >
                                            <ArrowRight className="w-6 h-6" />
                                        </button>
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                                            {selectedConversation.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-white font-bold">{selectedConversation.name}</h2>
                                            {selectedConversation.lastMessage?.listing && (
                                                <p className="text-white/70 text-xs flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {selectedConversation.lastMessage.listing.title}
                                                </p>
                                            )}
                                        </div>
                                        {/* زر حذف المحادثة */}
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                                            title="حذف المحادثة"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* نافذة تأكيد الحذف */}
                                    {showDeleteConfirm && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                                            <div className="bg-white rounded-2xl p-6 m-4 max-w-sm w-full shadow-xl" dir="rtl">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                                        <Trash2 className="w-6 h-6 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800">حذف المحادثة</h3>
                                                        <p className="text-sm text-gray-500">مع {selectedConversation.name}</p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 mb-6">
                                                    هل أنت متأكد من حذف هذه المحادثة؟ سيتم حذف جميع الرسائل نهائياً ولا يمكن استرجاعها.
                                                </p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={deleteConversation}
                                                        disabled={deletingConversation}
                                                        className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        {deletingConversation ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Trash2 className="w-4 h-4" />
                                                                حذف
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        إلغاء
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* منطقة الرسائل */}
                                    <div
                                        className="flex-1 overflow-y-auto p-4 space-y-2"
                                        style={{
                                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                                            backgroundColor: '#f0f2f5'
                                        }}
                                    >
                                        {currentMessages.map((msg, index) => {
                                            const isMine = msg.sender._id === user?.id;
                                            const showDate = index === 0 ||
                                                formatDate(currentMessages[index - 1]?.createdAt) !== formatDate(msg.createdAt);

                                            return (
                                                <div key={msg._id}>
                                                    {/* فاصل التاريخ */}
                                                    {showDate && (
                                                        <div className="flex justify-center my-4">
                                                            <span className="bg-white/90 text-gray-500 text-xs px-3 py-1 rounded-full shadow-sm">
                                                                {formatDate(msg.createdAt)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* فقاعة الرسالة */}
                                                    <div className={`flex ${isMine ? 'justify-start' : 'justify-end'} mb-1`}>
                                                        <div
                                                            className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isMine
                                                                ? 'bg-purple-500 text-white rounded-br-sm'
                                                                : 'bg-white text-gray-800 rounded-bl-sm'
                                                                } ${msg.isPending ? 'opacity-70' : ''}`}
                                                        >
                                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                                                                <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                                                                {isMine && (
                                                                    msg.isPending ? (
                                                                        <Clock className="w-3 h-3" />
                                                                    ) : msg.isRead ? (
                                                                        <CheckCheck className="w-3 h-3" />
                                                                    ) : (
                                                                        <Check className="w-3 h-3" />
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* حقل إرسال الرسالة */}
                                    <form onSubmit={sendMessage} className="bg-white border-t p-3 flex gap-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="اكتب رسالة..."
                                            className="flex-1 bg-gray-100 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                            disabled={sendingMessage}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sendingMessage}
                                            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:shadow-lg transition-all disabled:cursor-not-allowed"
                                        >
                                            {sendingMessage ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5 mr-0.5" />
                                            )}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                /* شاشة الترحيب عند عدم اختيار محادثة */
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                                        <MessageCircle className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-700 mb-2">مرحباً بك في الرسائل</h2>
                                    <p className="text-gray-500 max-w-sm">
                                        اختر محادثة من القائمة للبدء في التواصل مع الملاك والطلاب
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Messages;
