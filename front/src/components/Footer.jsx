/**
 * مكون الـ Footer
 * يظهر في أسفل كل الصفحات
 */

import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* الشعار والوصف */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">سكن الزقازيق</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            منصة متخصصة في توفير السكن المناسب لطلاب جامعة الزقازيق
                        </p>
                        <div className="flex gap-3">
                            <a href="https://facebook.com" target="_blank" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://twitter.com" target="_blank" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://instagram.com" target="_blank" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* روابط سريعة */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">روابط سريعة</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/" className="hover:text-white transition-colors">الرئيسية</Link></li>
                            <li><Link to="/search" className="hover:text-white transition-colors">البحث عن شقة</Link></li>
                            <li><Link to="/favorites" className="hover:text-white transition-colors">المفضلة</Link></li>
                            <li><Link to="/login" className="hover:text-white transition-colors">تسجيل الدخول</Link></li>
                        </ul>
                    </div>

                    {/* للملاك */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">للملاك</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/register" className="hover:text-white transition-colors">إنشاء حساب مالك</Link></li>
                            <li><Link to="/vendor/dashboard" className="hover:text-white transition-colors">لوحة التحكم</Link></li>
                            <li><Link to="/vendor/dashboard" className="hover:text-white transition-colors">إضافة إعلان</Link></li>
                        </ul>
                    </div>

                    {/* تواصل معنا */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">تواصل معنا</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-400" />
                                <span>الزقازيق، الشرقية، مصر</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-purple-400" />
                                <span dir="ltr">+20 100 162 7194</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-purple-400" />
                                <span>mahmoudbasery@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* حقوق النشر */}
                <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} سكن الزقازيق - جميع الحقوق محفوظة</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
