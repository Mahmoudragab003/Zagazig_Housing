import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Users, Home, Plus, Trash2, Eye, CheckCircle, XCircle, LogOut, BarChart3, TrendingUp, Clock, Search, Filter, MoreVertical, Edit, Shield, Loader2, MessageCircle, Star, ExternalLink, LayoutGrid } from 'lucide-react';
import { API_URL } from '../config';

const AdminDashboard = () => {
    const { user, token, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (!isAdmin()) { navigate('/login'); return; }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [listingsRes, usersRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/listings/admin/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/auth/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/stats/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const listingsData = await listingsRes.json();
            const usersData = await usersRes.json();
            const statsData = await statsRes.json();
            if (listingsData.success) { setListings(listingsData.data.listings); }
            if (usersData.success) { setUsers(usersData.data.users); }
            if (statsData.success) { setDashboardStats(statsData.data); }
        } catch (err) { console.error('Fetch error:', err); }
        setLoading(false);
    };

    const handleStatusChange = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/listings/${id}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteListing = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        try {
            const res = await fetch(`${API_URL}/listings/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) fetchData();
        } catch (err) { console.error(err); }
    };

    const handleToggleUser = async (id) => {
        try {
            const res = await fetch(`${API_URL}/auth/users/${id}/toggle-status`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        try {
            const res = await fetch(`${API_URL}/auth/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) fetchData();
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white`}>
            <div className="flex items-center justify-between">
                <div><p className="text-white/70 text-sm">{label}</p><p className="text-3xl font-bold mt-1">{value}</p></div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Icon className="w-6 h-6" /></div>
            </div>
        </div>
    );

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Sidebar */}
            <aside className="fixed right-0 top-0 w-64 h-full bg-slate-800/50 backdrop-blur-xl border-l border-white/10 p-4 flex flex-col">
                <div className="flex items-center gap-3 mb-8 p-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
                    <div><p className="text-white font-semibold">لوحة التحكم</p><p className="text-xs text-gray-400">مدير النظام</p></div>
                </div>
                <nav className="flex-1 space-y-2">
                    {[{ id: 'overview', icon: BarChart3, label: 'نظرة عامة' }, { id: 'listings', icon: Home, label: 'الإعلانات' }, { id: 'users', icon: Users, label: 'المستخدمين' }].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/5'}`}>
                            <item.icon className="w-5 h-5" /><span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* روابط سريعة */}
                <div className="border-t border-white/10 pt-4 mt-4 mb-4">
                    <p className="text-xs text-gray-500 px-4 mb-2">روابط سريعة</p>
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 transition-all">
                        <ExternalLink className="w-5 h-5" /><span>الصفحة الرئيسية</span>
                    </button>
                    <button onClick={() => navigate('/search')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 transition-all">
                        <LayoutGrid className="w-5 h-5" /><span>عرض الإعلانات</span>
                    </button>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"><LogOut className="w-5 h-5" /><span>تسجيل الخروج</span></button>
            </aside>

            {/* Main Content */}
            <main className="mr-64 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div><h1 className="text-2xl font-bold text-white">مرحباً، {user?.firstName}</h1><p className="text-gray-400">إليك ما يحدث اليوم</p></div>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"><Plus className="w-5 h-5" />إضافة إعلان</button>
                </div>

                {activeTab === 'overview' && dashboardStats && (
                    <div className="space-y-6">
                        {/* الصف الأول - الإحصائيات الرئيسية */}
                        <div className="grid grid-cols-4 gap-4">
                            <StatCard icon={Users} label="إجمالي المستخدمين" value={dashboardStats.users.total} color="from-purple-500 to-purple-600" />
                            <StatCard icon={Home} label="إجمالي الإعلانات" value={dashboardStats.listings.total} color="from-blue-500 to-blue-600" />
                            <StatCard icon={MessageCircle} label="إجمالي الرسائل" value={dashboardStats.messages.total} color="from-green-500 to-green-600" />
                            <StatCard icon={Star} label="إجمالي التقييمات" value={dashboardStats.reviews.total} color="from-amber-500 to-amber-600" />
                        </div>

                        {/* الصف الثاني - تفاصيل المستخدمين والإعلانات */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* المستخدمين */}
                            <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 p-6">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-400" />
                                    توزيع المستخدمين
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">الطلاب</span>
                                        <span className="text-white font-bold">{dashboardStats.users.students}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">الملاك</span>
                                        <span className="text-white font-bold">{dashboardStats.users.vendors}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">المديرين</span>
                                        <span className="text-white font-bold">{dashboardStats.users.admins}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                        <span className="text-green-400">جديد هذا الأسبوع</span>
                                        <span className="text-green-400 font-bold">+{dashboardStats.users.newThisWeek}</span>
                                    </div>
                                </div>
                            </div>

                            {/* الإعلانات */}
                            <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 p-6">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Home className="w-5 h-5 text-blue-400" />
                                    توزيع الإعلانات
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">نشط</span>
                                        <span className="text-green-400 font-bold">{dashboardStats.listings.active}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">قيد المراجعة</span>
                                        <span className="text-amber-400 font-bold">{dashboardStats.listings.pending}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">للإيجار</span>
                                        <span className="text-blue-400 font-bold">{dashboardStats.listings.rent}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">للبيع</span>
                                        <span className="text-purple-400 font-bold">{dashboardStats.listings.sell}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* أحدث المستخدمين والإعلانات */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* أحدث المستخدمين */}
                            <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 p-6">
                                <h3 className="text-white font-bold mb-4">أحدث المستخدمين</h3>
                                <div className="space-y-3">
                                    {dashboardStats.recent.users.map(u => (
                                        <div key={u._id} className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {u.firstName[0]}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm">{u.firstName} {u.lastName}</p>
                                                <p className="text-gray-500 text-xs">{u.email}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : u.role === 'vendor' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {u.role === 'admin' ? 'مدير' : u.role === 'vendor' ? 'مالك' : 'طالب'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* أحدث الإعلانات */}
                            <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 p-6">
                                <h3 className="text-white font-bold mb-4">أحدث الإعلانات</h3>
                                <div className="space-y-3">
                                    {dashboardStats.recent.listings.map(l => (
                                        <div key={l._id} className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <Home className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm">{l.title.substring(0, 25)}...</p>
                                                <p className="text-gray-500 text-xs">{l.vendor?.firstName} {l.vendor?.lastName}</p>
                                            </div>
                                            <span className="text-amber-400 font-bold text-sm">{l.price} ج.م</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'listings' && (
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl py-2 pr-10 pl-4 text-white placeholder-gray-400 w-64" /></div>
                        </div>
                        <table className="w-full">
                            <thead><tr className="border-b border-white/10 text-gray-400 text-sm"><th className="p-4 text-right">العنوان</th><th className="p-4 text-right">النوع</th><th className="p-4 text-right">السعر</th><th className="p-4 text-right">الحالة</th><th className="p-4 text-right">الإجراءات</th></tr></thead>
                            <tbody>
                                {listings.filter(l => l.title.includes(searchTerm)).map(listing => (
                                    <tr key={listing._id} className="border-b border-white/5 text-white hover:bg-white/5">
                                        <td className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center"><Home className="w-5 h-5 text-purple-400" /></div><div><p className="font-medium">{listing.title.substring(0, 30)}...</p><p className="text-sm text-gray-400">{listing.address?.district}</p></div></div></td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded-lg text-xs ${listing.type === 'rent' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{listing.type === 'rent' ? 'إيجار' : 'بيع'}</span></td>
                                        <td className="p-4">{listing.price.toLocaleString()} ج.م</td>
                                        <td className="p-4"><select value={listing.status} onChange={(e) => handleStatusChange(listing._id, e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white"><option value="active">نشط</option><option value="pending">معلق</option><option value="inactive">غير نشط</option></select></td>
                                        <td className="p-4"><div className="flex items-center gap-2"><button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Eye className="w-4 h-4" /></button><button onClick={() => handleDeleteListing(listing._id)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="border-b border-white/10 text-gray-400 text-sm"><th className="p-4 text-right">المستخدم</th><th className="p-4 text-right">البريد</th><th className="p-4 text-right">الدور</th><th className="p-4 text-right">الحالة</th><th className="p-4 text-right">الإجراءات</th></tr></thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="border-b border-white/5 text-white hover:bg-white/5">
                                        <td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">{u.firstName[0]}</div><p>{u.firstName} {u.lastName}</p></div></td>
                                        <td className="p-4 text-gray-400">{u.email}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded-lg text-xs ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : u.role === 'vendor' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>{u.role === 'admin' ? 'مدير' : u.role === 'vendor' ? 'مالك' : 'طالب'}</span></td>
                                        <td className="p-4"><button onClick={() => handleToggleUser(u._id)} className={`px-3 py-1 rounded-lg text-xs ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{u.isActive ? 'نشط' : 'معطل'}</button></td>
                                        <td className="p-4">{u.role !== 'admin' && <button onClick={() => handleDeleteUser(u._id)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Add Listing Modal */}
            {showAddModal && <AddListingModal onClose={() => setShowAddModal(false)} token={token} onSuccess={fetchData} />}
        </div>
    );
};

const AddListingModal = ({ onClose, token, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', description: '', price: '', type: 'rent', area: '', 'address.street': '', 'address.district': '', bedrooms: 1, bathrooms: 1 });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/listings`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...formData, address: { street: formData['address.street'], district: formData['address.district'] } })
            });
            if (res.ok) { onSuccess(); onClose(); }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-white/10" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">إضافة إعلان جديد</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="العنوان" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                    <textarea placeholder="الوصف" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white h-20" />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="السعر" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white"><option value="rent">إيجار</option><option value="sell">بيع</option></select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <input type="number" placeholder="المساحة" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} required className="bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                        <input type="number" placeholder="غرف" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} className="bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                        <input type="number" placeholder="حمامات" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} className="bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                    </div>
                    <input type="text" placeholder="الشارع" value={formData['address.street']} onChange={(e) => setFormData({ ...formData, 'address.street': e.target.value })} required className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                    <input type="text" placeholder="الحي" value={formData['address.district']} onChange={(e) => setFormData({ ...formData, 'address.district': e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white" />
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border border-white/20 rounded-xl text-white hover:bg-white/5">إلغاء</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white">{loading ? 'جاري الإضافة...' : 'إضافة'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
