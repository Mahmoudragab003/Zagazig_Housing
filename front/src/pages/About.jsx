/**
 * صفحة من نحن
 * تعريف بالموقع والفريق
 */

import { Building2, Users, Target, Award, Mail, Phone, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">من نحن</h1>
                    <p className="text-white/80 text-lg max-w-2xl mx-auto">
                        منصة سكن الزقازيق هي وجهتك الأولى للبحث عن السكن المناسب لطلاب جامعة الزقازيق
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4">
                    {/* About Section */}
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">قصتنا</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                بدأت فكرة "سكن الزقازيق" من معاناة الطلاب في البحث عن سكن مناسب قريب من الجامعة.
                                كنا نرى صعوبة التواصل بين الملاك والطلاب، وعدم وجود منصة موحدة تجمع كل الخيارات المتاحة.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                لذلك قررنا إنشاء هذه المنصة لتكون الجسر الذي يربط بين الطلاب الباحثين عن سكن
                                وأصحاب العقارات، بطريقة سهلة وآمنة وشفافة.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
                            <div className="grid grid-cols-2 gap-6 text-center">
                                <div>
                                    <div className="text-4xl font-bold mb-2">500+</div>
                                    <div className="text-white/80">شقة متاحة</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold mb-2">1000+</div>
                                    <div className="text-white/80">طالب مسجل</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold mb-2">200+</div>
                                    <div className="text-white/80">مالك عقار</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold mb-2">98%</div>
                                    <div className="text-white/80">رضا العملاء</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Values Section */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">قيمنا</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Target className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-gray-800 mb-2">الشفافية</h3>
                                <p className="text-gray-600 text-sm">نوفر معلومات دقيقة وشفافة عن كل العقارات المتاحة</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="font-bold text-gray-800 mb-2">خدمة العملاء</h3>
                                <p className="text-gray-600 text-sm">فريق دعم متاح للمساعدة في أي وقت</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-8 h-8 text-amber-600" />
                                </div>
                                <h3 className="font-bold text-gray-800 mb-2">الجودة</h3>
                                <p className="text-gray-600 text-sm">نتحقق من جودة جميع العقارات المعروضة</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">تواصل معنا</h2>
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                                    <MapPin className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">العنوان</h3>
                                <p className="text-gray-600 text-sm">الزقازيق، الشرقية، مصر</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                    <Phone className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">الهاتف</h3>
                                <p className="text-gray-600 text-sm" dir="ltr">+20 100 162 7194</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1">البريد الإلكتروني</h3>
                                <p className="text-gray-600 text-sm">mahmoudbasery@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
