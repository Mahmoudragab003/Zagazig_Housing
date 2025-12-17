import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Edit, Trash2, Eye, LogOut, Home, BarChart3, Clock, CheckCircle, XCircle, Loader2, MapPin, DollarSign, MessageCircle, User } from 'lucide-react';
import { API_URL, getImageUrl } from '../config';

const VendorDashboard = () => {
    const { user, token, logout, isVendor } = useAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingListing, setEditingListing] = useState(null);

    useEffect(() => {
        if (!isVendor()) { navigate('/login'); return; }
        fetchListings();
        fetchMessages();
    }, []);

    const fetchListings = async () => {
        try {
            const res = await fetch(`${API_URL}/listings/my-listings`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setListings(data.data.listings);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_URL}/messages`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                // فلترة الرسائل الواردة فقط
                const incoming = data.data.messages.filter(m => m.receiver._id === user?.id);
                setMessages(incoming);
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        try {
            await fetch(`${API_URL}/listings/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            fetchListings();
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const stats = {
        total: listings.length,
        active: listings.filter(l => l.status === 'active').length,
        pending: listings.filter(l => l.status === 'pending').length,
        views: listings.reduce((sum, l) => sum + (l.viewCount || 0), 0)
    };

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-semibold">لوحة المالك</p>
                            <p className="text-xs text-gray-400">{user?.companyName || user?.firstName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/')} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"><Home className="w-5 h-5" /></button>
                        <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><LogOut className="w-5 h-5" /></button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
                        <p className="text-white/70 text-sm">إجمالي الإعلانات</p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white">
                        <p className="text-white/70 text-sm">إعلانات نشطة</p>
                        <p className="text-3xl font-bold">{stats.active}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
                        <p className="text-white/70 text-sm">قيد المراجعة</p>
                        <p className="text-3xl font-bold">{stats.pending}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
                        <p className="text-white/70 text-sm">إجمالي المشاهدات</p>
                        <p className="text-3xl font-bold">{stats.views}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">إعلاناتي</h2>
                    <button onClick={() => { setEditingListing(null); setShowModal(true); }} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all">
                        <Plus className="w-5 h-5" />إضافة إعلان جديد
                    </button>
                </div>

                {/* Listings Grid */}
                {listings.length === 0 ? (
                    <div className="bg-slate-800/50 rounded-2xl p-12 text-center">
                        <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">لا توجد إعلانات بعد</p>
                        <button onClick={() => setShowModal(true)} className="text-amber-400 hover:underline">أضف أول إعلان</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map(listing => (
                            <div key={listing._id} className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 overflow-hidden group">
                                <div className="h-40 bg-gradient-to-br from-amber-400 to-orange-600 relative">
                                    {listing.images?.[0] ? <img src={getImageUrl(listing.images[0])} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-12 h-12 text-white/50" /></div>}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2 py-1 rounded-lg text-xs ${listing.status === 'active' ? 'bg-green-500' : listing.status === 'pending' ? 'bg-amber-500' : 'bg-gray-500'} text-white`}>
                                            {listing.status === 'active' ? 'نشط' : listing.status === 'pending' ? 'قيد المراجعة' : 'غير نشط'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-semibold mb-2 line-clamp-1">{listing.title}</h3>
                                    <div className="flex items-center text-gray-400 text-sm mb-3">
                                        <MapPin className="w-4 h-4 ml-1" />{listing.address?.district || 'الزقازيق'}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-amber-400 font-bold">{listing.price.toLocaleString()} ج.م</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => navigate(`/listing/${listing._id}`)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => { setEditingListing(listing); setShowModal(true); }} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(listing._id)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* قسم الرسائل الواردة */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-green-400" />
                            الرسائل الواردة
                            {messages.length > 0 && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{messages.length}</span>
                            )}
                        </h2>
                    </div>

                    {messages.length === 0 ? (
                        <div className="bg-slate-800/50 rounded-2xl p-8 text-center">
                            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">لا توجد رسائل جديدة</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map(msg => (
                                <div key={msg._id} className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 p-5">
                                    <div className="flex items-start gap-4">
                                        {/* صورة المرسل */}
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {msg.sender?.firstName?.[0] || 'م'}
                                        </div>

                                        <div className="flex-1">
                                            {/* اسم المرسل والوقت */}
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-white font-semibold">
                                                    {msg.sender?.firstName} {msg.sender?.lastName}
                                                </h3>
                                                <span className="text-gray-500 text-xs">
                                                    {new Date(msg.createdAt).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            {/* الإعلان المرتبط */}
                                            {msg.listing && (
                                                <div className="flex items-center gap-1 text-amber-400 text-sm mb-2">
                                                    <Building2 className="w-4 h-4" />
                                                    <span>بخصوص: {msg.listing.title}</span>
                                                </div>
                                            )}

                                            {/* نص الرسالة */}
                                            <p className="text-gray-300 bg-slate-700/50 p-3 rounded-xl">
                                                {msg.message}
                                            </p>

                                            {/* زر الرد */}
                                            <button
                                                onClick={() => navigate(`/messages?reply=${msg.sender._id}&listing=${msg.listing?._id}`)}
                                                className="mt-3 flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                الرد على الرسالة
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Add/Edit Modal */}
            {showModal && <ListingModal listing={editingListing} token={token} onClose={() => setShowModal(false)} onSuccess={fetchListings} />}
        </div>
    );
};

const ListingModal = ({ listing, token, onClose, onSuccess }) => {
    const amenitiesList = [
        { key: 'furnished', label: 'مفروشة' },
        { key: 'airConditioning', label: 'تكييف' },
        { key: 'heating', label: 'تدفئة' },
        { key: 'wifi', label: 'واي فاي' },
        { key: 'parking', label: 'موقف سيارات' },
        { key: 'elevator', label: 'مصعد' },
        { key: 'balcony', label: 'بلكونة' },
        { key: 'security', label: 'أمن' },
        { key: 'kitchen', label: 'مطبخ' },
        { key: 'washingMachine', label: 'غسالة' }
    ];

    const [formData, setFormData] = useState(listing ? {
        title: listing.title, description: listing.description, price: listing.price, type: listing.type, area: listing.area,
        'address.street': listing.address?.street || '', 'address.district': listing.address?.district || '',
        bedrooms: listing.bedrooms, bathrooms: listing.bathrooms, images: listing.images || [],
        amenities: listing.amenities || {}
    } : {
        title: '', description: '', price: '', type: 'rent', area: '', 'address.street': '', 'address.district': '',
        bedrooms: 1, bathrooms: 1, images: [],
        amenities: {}
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const toggleAmenity = (key) => {
        setFormData(prev => ({
            ...prev,
            amenities: { ...prev.amenities, [key]: !prev.amenities[key] }
        }));
    };

    // رفع الصور
    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formDataUpload = new FormData();

        for (let i = 0; i < files.length; i++) {
            formDataUpload.append('images', files[i]);
        }

        try {
            const res = await fetch(`${API_URL}/upload/images`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });
            const data = await res.json();

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...data.data.images]
                }));
            } else {
                setError(data.message || 'خطأ في رفع الصور');
            }
        } catch (err) {
            setError('خطأ في رفع الصور');
        }
        setUploading(false);
    };

    // حذف صورة
    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const url = listing ? `${API_URL}/listings/${listing._id}` : `${API_URL}/listings`;
        const method = listing ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ...formData,
                    address: { street: formData['address.street'], district: formData['address.district'] },
                    images: formData.images,
                    amenities: formData.amenities
                })
            });
            const data = await res.json();
            if (data.success) { onSuccess(); onClose(); }
            else { setError(data.message || 'حدث خطأ أثناء الحفظ'); }
        } catch (err) { setError('خطأ في الاتصال بالخادم'); }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{listing ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}</h2>
                {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="عنوان الإعلان" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white placeholder-gray-400" />
                    <textarea placeholder="الوصف التفصيلي" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={3} className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white placeholder-gray-400" />

                    {/* قسم رفع الصور */}
                    <div className="space-y-3">
                        <label className="block text-white text-sm font-medium">صور الشقة</label>

                        {/* عرض الصور المرفوعة */}
                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`صورة ${idx + 1}`}
                                            className="w-full h-20 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* زر رفع الصور */}
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-amber-400 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                            {uploading ? (
                                <div className="flex items-center gap-2 text-amber-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>جاري الرفع...</span>
                                </div>
                            ) : (
                                <>
                                    <Plus className="w-8 h-8 text-gray-400" />
                                    <span className="text-gray-400 text-sm mt-1">اضغط لإضافة صور</span>
                                </>
                            )}
                        </label>
                        <p className="text-gray-500 text-xs">الحد الأقصى: 10 صور، 5MB لكل صورة</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="السعر" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white">
                            <option value="rent">للإيجار</option><option value="sell">للبيع</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <input type="number" placeholder="المساحة م²" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} required className="bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                        <input type="number" placeholder="غرف نوم" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} className="bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                        <input type="number" placeholder="حمامات" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} className="bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                    </div>
                    <input type="text" placeholder="العنوان / الشارع" value={formData['address.street']} onChange={(e) => setFormData({ ...formData, 'address.street': e.target.value })} required className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                    <input type="text" placeholder="الحي / المنطقة" value={formData['address.district']} onChange={(e) => setFormData({ ...formData, 'address.district': e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />

                    {/* المميزات */}
                    <div className="space-y-2">
                        <label className="block text-white text-sm font-medium">المميزات</label>
                        <div className="grid grid-cols-2 gap-2">
                            {amenitiesList.map(item => (
                                <label key={item.key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/5">
                                    <input
                                        type="checkbox"
                                        checked={formData.amenities[item.key] || false}
                                        onChange={() => toggleAmenity(item.key)}
                                        className="w-4 h-4 text-amber-500 bg-white/10 border-white/30 rounded focus:ring-amber-500"
                                    />
                                    <span className="text-gray-300 text-sm">{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-white/20 rounded-xl text-white hover:bg-white/5">إلغاء</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-medium">
                            {loading ? 'جاري الحفظ...' : listing ? 'حفظ التعديلات' : 'إضافة الإعلان'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorDashboard;

