import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Mail, Phone, Lock, Save, Loader2, Camera, GraduationCap, Building2, Shield, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';

const Profile = () => {
    const { user, token, updateProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '',
        faculty: user?.faculty || '', companyName: user?.companyName || ''
    });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        const result = await updateProfile(formData);
        if (result.success) { setMessage({ type: 'success', text: 'تم تحديث الملف الشخصي بنجاح' }); }
        else { setMessage({ type: 'error', text: result.error }); }
        setLoading(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'كلمات المرور غير متطابقة' }); return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
            });
            const data = await res.json();
            if (data.success) { setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' }); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
            else { setMessage({ type: 'error', text: data.message }); }
        } catch (err) { setMessage({ type: 'error', text: 'حدث خطأ' }); }
        setLoading(false);
    };

    const getRoleInfo = () => {
        switch (user?.role) {
            case 'admin': return { icon: Shield, label: 'مدير النظام', color: 'text-red-500 bg-red-100' };
            case 'vendor': return { icon: Building2, label: 'مالك عقار', color: 'text-amber-500 bg-amber-100' };
            default: return { icon: GraduationCap, label: 'طالب', color: 'text-green-500 bg-green-100' };
        }
    };
    const roleInfo = getRoleInfo();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">{user?.firstName?.[0]}</div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-lg"><Camera className="w-4 h-4" /></button>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
                            <p className="text-white/80">{user?.email}</p>
                            <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm ${roleInfo.color}`}>
                                <roleInfo.icon className="w-4 h-4" />{roleInfo.label}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.type === 'success' && <CheckCircle className="w-5 h-5" />}{message.text}
                    </div>
                )}

                {/* Profile Form */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">المعلومات الشخصية</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-gray-600 mb-1">الاسم الأول</label><input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full border rounded-xl py-2 px-3 focus:ring-2 focus:ring-purple-500" /></div>
                            <div><label className="block text-sm text-gray-600 mb-1">الاسم الأخير</label><input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full border rounded-xl py-2 px-3" /></div>
                        </div>
                        <div><label className="block text-sm text-gray-600 mb-1">رقم الهاتف</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border rounded-xl py-2 px-3" /></div>
                        {user?.role === 'student' && (
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">الكلية</label>
                                <input type="text" value={formData.faculty} onChange={(e) => setFormData({ ...formData, faculty: e.target.value })} className="w-full border rounded-xl py-2 px-3" />
                            </div>
                        )}
                        {user?.role === 'vendor' && (
                            <div><label className="block text-sm text-gray-600 mb-1">اسم الشركة</label><input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="w-full border rounded-xl py-2 px-3" /></div>
                        )}
                        <button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:shadow-lg">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}حفظ التغييرات
                        </button>
                    </form>
                </div>

                {/* Password Form */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">تغيير كلمة المرور</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div><label className="block text-sm text-gray-600 mb-1">كلمة المرور الحالية</label><input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full border rounded-xl py-2 px-3" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm text-gray-600 mb-1">كلمة المرور الجديدة</label><input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full border rounded-xl py-2 px-3" required /></div>
                            <div><label className="block text-sm text-gray-600 mb-1">تأكيد كلمة المرور</label><input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full border rounded-xl py-2 px-3" required /></div>
                        </div>
                        <button type="submit" disabled={loading} className="bg-gray-800 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-900">
                            <Lock className="w-5 h-5" />تغيير كلمة المرور
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
