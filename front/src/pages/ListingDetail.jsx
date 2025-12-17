import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Reviews from '../components/Reviews';
import ContactForm from '../components/ContactForm';
import SimilarListings from '../components/SimilarListings';
import { Building2, MapPin, Bed, Bath, Maximize, Phone, ArrowRight, Heart, Share2, CheckCircle, XCircle, Loader2, Calendar, Eye, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL, getImageUrl } from '../config';

const ListingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactInitialMessage, setContactInitialMessage] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchListing();
        checkFavorite();
        setCurrentImageIndex(0);
        // حفظ سجل المشاهدة للتوصيات الذكية
        const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
        if (!history.includes(id)) {
            history.push(id);
            localStorage.setItem('viewHistory', JSON.stringify(history.slice(-20))); // آخر 20 شقة
        }
    }, [id]);

    const checkFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.some(f => f._id === id));
    };

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (isFavorite) {
            const updated = favorites.filter(f => f._id !== id);
            localStorage.setItem('favorites', JSON.stringify(updated));
        } else {
            favorites.push(listing);
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
        setIsFavorite(!isFavorite);
    };

    const fetchListing = async () => {
        try {
            const res = await fetch(`${API_URL}/listings/${id}`);
            const data = await res.json();
            if (data.success) setListing(data.data.listing);
            else navigate('/');
        } catch (err) { console.error(err); navigate('/'); }
        setLoading(false);
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;
    if (!listing) return null;

    const amenityLabels = {
        furnished: 'مفروشة', airConditioning: 'تكييف', heating: 'تدفئة', wifi: 'واي فاي', parking: 'موقف سيارات',
        elevator: 'مصعد', balcony: 'بلكونة', security: 'أمن', kitchen: 'مطبخ', washingMachine: 'غسالة'
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
                        <ArrowRight className="w-5 h-5" />رجوع
                    </button>
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-800">سكن الزقازيق</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <button onClick={toggleFavorite} className={`p-2 hover:bg-gray-100 rounded-lg ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}><Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} /></button>
                        <div className="relative group">
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><Share2 className="w-5 h-5" /></button>
                            <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[150px]">
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700">
                                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">f</div>
                                    فيسبوك
                                </a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(listing?.title || '')}`} target="_blank" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700">
                                    <div className="w-6 h-6 bg-sky-500 rounded flex items-center justify-center text-white text-xs">𝕏</div>
                                    تويتر
                                </a>
                                <a href={`https://wa.me/?text=${encodeURIComponent((listing?.title || '') + ' - ' + window.location.href)}`} target="_blank" className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700">
                                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs">W</div>
                                    واتساب
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery with Navigation */}
                        <div className="bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl h-96 relative overflow-hidden group">
                            {listing.images?.length > 0 ? (
                                <>
                                    <img
                                        src={getImageUrl(listing.images[currentImageIndex])}
                                        alt={`${listing.title} - صورة ${currentImageIndex + 1}`}
                                        className="w-full h-full object-cover transition-opacity duration-300"
                                    />

                                    {/* Navigation Arrows - Only show if more than 1 image */}
                                    {listing.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentImageIndex(prev => prev === 0 ? listing.images.length - 1 : prev - 1)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentImageIndex(prev => prev === listing.images.length - 1 ? 0 : prev + 1)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                        </>
                                    )}

                                    {/* Image Counter */}
                                    {listing.images.length > 1 && (
                                        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
                                            {currentImageIndex + 1} / {listing.images.length}
                                        </div>
                                    )}

                                    {/* Thumbnail Dots */}
                                    {listing.images.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {listing.images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentImageIndex
                                                        ? 'bg-white w-6'
                                                        : 'bg-white/50 hover:bg-white/80'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Building2 className="w-24 h-24 text-white/50" />
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${listing.type === 'rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>{listing.type === 'rent' ? 'للإيجار' : 'للبيع'}</span>
                                {listing.isFeatured && <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm">مميز</span>}
                            </div>
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                                <Eye className="w-4 h-4" />{listing.viewCount} مشاهدة
                            </div>
                        </div>

                        {/* Thumbnail Strip */}
                        {listing.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-300">
                                {listing.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                                            ? 'border-purple-500 ring-2 ring-purple-300'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`${listing.title} - مصغرة ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Title & Price */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">{listing.title}</h1>
                            <div className="flex items-center text-gray-500 mb-4">
                                <MapPin className="w-5 h-5 ml-1 text-purple-500" />
                                {listing.fullAddress || `${listing.address?.street}, ${listing.address?.district || 'الزقازيق'}`}
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-3xl font-bold text-purple-600">{listing.price.toLocaleString()}</span>
                                    <span className="text-gray-500 mr-1">ج.م {listing.type === 'rent' && '/ شهرياً'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <span className="flex items-center gap-1"><Bed className="w-5 h-5" />{listing.bedrooms} غرف</span>
                                    <span className="flex items-center gap-1"><Bath className="w-5 h-5" />{listing.bathrooms} حمام</span>
                                    <span className="flex items-center gap-1"><Maximize className="w-5 h-5" />{listing.area} م²</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">الوصف</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
                        </div>

                        {/* Amenities */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">المميزات</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(listing.amenities || {}).map(([key, value]) => (
                                    <div key={key} className={`flex items-center gap-2 p-3 rounded-xl ${value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                                        {value ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        <span>{amenityLabels[key] || key}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rent Details */}
                        {listing.type === 'rent' && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">تفاصيل الإيجار</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-purple-50 rounded-xl">
                                        <p className="text-gray-500 text-sm">الحد الأدنى للإيجار</p>
                                        <p className="text-purple-600 font-bold">{listing.rentDetails?.minimumPeriod ? `${listing.rentDetails.minimumPeriod} شهر` : 'غير محدد'}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-xl">
                                        <p className="text-gray-500 text-sm">التأمين</p>
                                        <p className="text-purple-600 font-bold">{listing.rentDetails?.deposit ? `${listing.rentDetails.deposit.toLocaleString()} ج.م` : 'غير محدد'}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-xl">
                                        <p className="text-gray-500 text-sm">الفواتير مشمولة</p>
                                        <p className="text-purple-600 font-bold">{listing.rentDetails?.billsIncluded ? 'نعم' : 'لا'}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-xl">
                                        <p className="text-gray-500 text-sm">متاح من</p>
                                        <p className="text-purple-600 font-bold">{listing.rentDetails?.availableFrom ? new Date(listing.rentDetails.availableFrom).toLocaleDateString('ar-EG') : 'متاح الآن'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* التقييمات */}
                        <Reviews listingId={id} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Vendor Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                    {listing.vendor?.firstName?.[0] || 'م'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{listing.vendor?.firstName} {listing.vendor?.lastName}</p>
                                    <p className="text-gray-500 text-sm">{listing.vendor?.companyName || 'مالك عقار'}</p>
                                </div>
                            </div>

                            {isAuthenticated() ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setContactInitialMessage('');
                                            setShowContactForm(true);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                                    >
                                        <MessageCircle className="w-5 h-5" />أرسل رسالة
                                    </button>
                                    <button
                                        onClick={() => {
                                            setContactInitialMessage('مرحباً، أرغب في حجز موعد لمعاينة هذا العقار. يرجى التواصل معي لتحديد الوقت المناسب.');
                                            setShowContactForm(true);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full bg-white border border-purple-500 text-purple-600 py-3 rounded-xl font-medium hover:bg-purple-50 transition-all"
                                    >
                                        <Calendar className="w-5 h-5" />طلب معاينة
                                    </button>
                                    <a href={`tel:${listing.vendor?.phone}`} className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all">
                                        <Phone className="w-5 h-5" />اتصل الآن
                                    </a>
                                    <a href={`https://wa.me/20${listing.vendor?.phone?.replace(/^0+/, '')}`} target="_blank" className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-all">
                                        واتساب
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-gray-500 mb-4">سجل دخولك لرؤية بيانات التواصل</p>
                                    <Link to="/login" className="block w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all">
                                        تسجيل الدخول
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Quick Info */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4">معلومات سريعة</h3>
                            <div className="space-y-3 text-sm">
                                {listing.floor !== undefined && listing.floor !== null && (
                                    <div className="flex items-center justify-between"><span className="text-gray-500">الطابق</span><span className="text-gray-800">{listing.floor}</span></div>
                                )}
                                {listing.totalFloors && (
                                    <div className="flex items-center justify-between"><span className="text-gray-500">عدد الطوابق</span><span className="text-gray-800">{listing.totalFloors}</span></div>
                                )}
                                {listing.area && listing.price && Math.round(listing.price / listing.area) > 100 && (
                                    <div className="flex items-center justify-between"><span className="text-gray-500">السعر/م²</span><span className="text-gray-800">{Math.round(listing.price / listing.area).toLocaleString()} ج.م</span></div>
                                )}
                                <div className="flex items-center justify-between"><span className="text-gray-500">تاريخ النشر</span><span className="text-gray-800">{new Date(listing.createdAt).toLocaleDateString('ar-EG')}</span></div>
                            </div>
                        </div>

                        {/* شقق مشابهة */}
                        <SimilarListings listingId={id} />
                    </div>
                </div>
            </main>

            {/* نافذة التواصل */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <ContactForm
                            listingId={id}
                            vendorId={listing.vendor?._id}
                            vendorName={`${listing.vendor?.firstName} ${listing.vendor?.lastName}`}
                            initialMessage={contactInitialMessage}
                            onClose={() => setShowContactForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingDetail;
