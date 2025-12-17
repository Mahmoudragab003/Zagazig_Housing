/**
 * مكون المساعد الذكي (AI Chat Assistant)
 * شات بوت للبحث باللغة الطبيعية
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MessageCircle,
    X,
    Send,
    Bot,
    User,
    Loader2,
    Sparkles,
    Building2,
    MapPin,
    ArrowLeft
} from 'lucide-react';
import { API_URL, getImageUrl } from '../config';

const AIChatAssistant = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: 'أهلاً! 👋 أنا المساعد الذكي لسكن الزقازيق. أخبرني إيه اللي بتدور عليه؟',
            suggestions: [
                { text: 'شقق للإيجار', query: 'شقق للإيجار' },
                { text: 'قريب من الجامعة', query: 'شقة قريبة من الجامعة' },
                { text: 'مفروشة', query: 'شقة مفروشة' }
            ]
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const sendMessage = async (text) => {
        if (!text.trim() || isLoading) return;

        // إضافة رسالة المستخدم
        setMessages(prev => [...prev, { type: 'user', text }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/ai/smart-search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text })
            });

            const data = await res.json();

            if (data.success) {
                const botMessage = {
                    type: 'bot',
                    text: data.data.message,
                    listings: data.data.listings?.slice(0, 3),
                    suggestions: data.data.suggestions?.map(s => ({
                        text: s.text,
                        query: s.text
                    })),
                    filters: data.data.filters,
                    totalCount: data.data.count
                };
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (error) {
            console.error('AI search error:', error);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: 'عفواً، حدث خطأ. جرب تاني! 😅'
            }]);
        }

        setIsLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(suggestion.query);
    };

    const viewAllResults = (filters) => {
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
        if (filters.district) params.append('district', filters.district);
        if (filters.furnished) params.append('furnished', 'true');
        if (filters.nearCampus) params.append('nearCampus', 'true');

        navigate(`/search?${params.toString()}`);
        setIsOpen(false);
    };

    return (
        <>
            {/* زر فتح الشات */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl hover:scale-110 transition-all ${isOpen ? 'hidden' : ''}`}
            >
                <Sparkles className="w-6 h-6" />
            </button>

            {/* نافذة الشات */}
            {isOpen && (
                <div className="fixed bottom-6 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
                    {/* رأس الشات */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">المساعد الذكي</h3>
                                <p className="text-white/70 text-xs">أسألني عن أي شقة!</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* منطقة الرسائل */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" dir="rtl">
                        {messages.map((msg, index) => (
                            <div key={index}>
                                {/* رسالة */}
                                <div className={`flex ${msg.type === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`flex items-start gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user'
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                                            }`}>
                                            {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>

                                        {/* Message bubble */}
                                        <div className={`rounded-2xl px-4 py-2 ${msg.type === 'user'
                                                ? 'bg-purple-500 text-white rounded-br-sm'
                                                : 'bg-white shadow-sm rounded-bl-sm'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* نتائج الشقق */}
                                {msg.listings && msg.listings.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {msg.listings.map((listing) => (
                                            <div
                                                key={listing._id}
                                                onClick={() => {
                                                    navigate(`/listing/${listing._id}`);
                                                    setIsOpen(false);
                                                }}
                                                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex gap-3"
                                            >
                                                {listing.images?.[0] ? (
                                                    <img
                                                        src={getImageUrl(listing.images[0])}
                                                        alt={listing.title}
                                                        className="w-16 h-16 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center">
                                                        <Building2 className="w-6 h-6 text-purple-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-800 text-sm truncate">{listing.title}</h4>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {listing.address?.district || 'الزقازيق'}
                                                    </p>
                                                    <p className="text-sm font-bold text-purple-600 mt-1">
                                                        {listing.price?.toLocaleString()} ج.م
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* زر عرض كل النتائج */}
                                        {msg.totalCount > 3 && (
                                            <button
                                                onClick={() => viewAllResults(msg.filters)}
                                                className="w-full text-center text-purple-600 hover:text-purple-700 text-sm py-2 flex items-center justify-center gap-1"
                                            >
                                                عرض كل النتائج ({msg.totalCount})
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* اقتراحات */}
                                {msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 justify-end">
                                        {msg.suggestions.map((suggestion, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="bg-white border border-purple-200 text-purple-600 px-3 py-1 rounded-full text-xs hover:bg-purple-50 transition-colors"
                                            >
                                                {suggestion.text}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading */}
                        {isLoading && (
                            <div className="flex justify-end">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                                        <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* حقل الإدخال */}
                    <form onSubmit={handleSubmit} className="p-3 bg-white border-t flex gap-2" dir="rtl">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="اسألني عن شقة..."
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:shadow-lg transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default AIChatAssistant;
