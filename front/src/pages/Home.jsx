/**
 * الصفحة الرئيسية
 * تعرض الإعلانات المميزة وأحدث الإعلانات
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    Building2,
    MapPin,
    Bed,
    Bath,
    Maximize,
    Heart,
    Search,
    Star,
    Loader2
} from 'lucide-react';

import { API_URL, getImageUrl } from '../config';
import AIChatAssistant from '../components/AIChatAssistant';
import SmartRecommendations from '../components/SmartRecommendations';

const Home = () => {
    // الحالة
    const [listings, setListings] = useState([]);
    const [featuredListings, setFeaturedListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);

    const navigate = useNavigate();

    // جلب البيانات عند تحميل الصفحة
    useEffect(() => {
        fetchAllListings();
        fetchFeaturedListings();
    }, []);

    // Slider Auto-play
    useEffect(() => {
        if (featuredListings.length > 0) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % Math.min(featuredListings.length, 5));
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [featuredListings]);

    /**
     * جلب جميع الإعلانات
     */
    const fetchAllListings = async () => {
        try {
            const response = await fetch(`${API_URL}/listings`);
            const data = await response.json();

            if (data.success) {
                setListings(data.data.listings);
            }
        } catch (error) {
            console.error('خطأ في جلب الإعلانات:', error);
        }
        setIsLoading(false);
    };

    /**
     * جلب الإعلانات المميزة
     */
    const fetchFeaturedListings = async () => {
        try {
            const response = await fetch(`${API_URL}/listings/featured`);
            const data = await response.json();

            if (data.success) {
                setFeaturedListings(data.data.listings);
            }
        } catch (error) {
            console.error('خطأ في جلب الإعلانات المميزة:', error);
        }
    };

    /**
     * معالجة البحث
     */
    const handleSearchSubmit = (event) => {
        event.preventDefault();
        navigate(`/search?q=${searchQuery}`);
    };

    /**
     * مكون كارد الإعلان
     */
    const ListingCard = ({ listing }) => {
        // تحديد نوع الإعلان (إيجار/بيع)
        const isRental = listing.type === 'rent';
        const typeLabel = isRental ? 'للإيجار' : 'للبيع';
        const typeColor = isRental ? 'bg-blue-500' : 'bg-green-500';

        // المفضلة
        const [isFavorite, setIsFavorite] = useState(() => {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            return favorites.some(fav => fav._id === listing._id);
        });

        const toggleFavorite = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (isFavorite) {
                const updated = favorites.filter(fav => fav._id !== listing._id);
                localStorage.setItem('favorites', JSON.stringify(updated));
            } else {
                favorites.push(listing);
                localStorage.setItem('favorites', JSON.stringify(favorites));
            }
            setIsFavorite(!isFavorite);
        };

        return (
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">

                {/* صورة الإعلان */}
                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-600">
                    {listing.images?.[0] ? (
                        <img
                            src={getImageUrl(listing.images[0])}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-16 h-16 text-white/50" />
                        </div>
                    )}

                    {/* شارة النوع */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColor} text-white`}>
                            {typeLabel}
                        </span>
                    </div>

                    {/* شارة مميز */}
                    {listing.isFeatured && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            مميز
                        </div>
                    )}

                    {/* زر المفضلة */}
                    <button
                        onClick={toggleFavorite}
                        className={`absolute bottom-3 left-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-all ${isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* تفاصيل الإعلان */}
                <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">
                        {listing.title}
                    </h3>

                    {/* الموقع */}
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                        <MapPin className="w-4 h-4 ml-1" />
                        {listing.address?.district || 'الزقازيق'}
                    </div>

                    {/* المواصفات */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {listing.bedrooms}
                        </span>
                        <span className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {listing.bathrooms}
                        </span>
                        <span className="flex items-center gap-1">
                            <Maximize className="w-4 h-4" />
                            {listing.area} م²
                        </span>
                    </div>

                    {/* السعر ورابط التفاصيل */}
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-purple-600">
                            {listing.price.toLocaleString()}{' '}
                            <span className="text-sm text-gray-500">
                                ج.م{isRental && '/شهر'}
                            </span>
                        </span>
                        <Link
                            to={`/listing/${listing._id}`}
                            className="text-purple-600 text-sm font-medium hover:underline"
                        >
                            عرض التفاصيل
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
            {/* شريط التنقل */}
            <Navbar />

            {/* Hero Slider */}
            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                {featuredListings.length > 0 ? (
                    featuredListings.slice(0, 5).map((listing, index) => (
                        <div
                            key={listing._id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
                                }`}
                            style={{
                                backgroundImage: `url(${getImageUrl(listing.images[0])})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <div className="absolute inset-0 bg-black/50" />
                        </div>
                    ))
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800" />
                )}

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                            ابحث عن سكنك المثالي
                            <br />
                            <span className="text-purple-300">بالقرب من جامعة الزقازيق</span>
                        </h1>
                        <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
                            أكبر تجمع للشقق والسكن الطلابي في الزقازيق. تصفح مئات الخيارات وتواصل مع الملاك مباشرة.
                        </p>

                        {/* Search Bar */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="bg-white rounded-2xl p-2 flex items-center gap-2 shadow-2xl max-w-3xl mx-auto"
                        >
                            <div className="flex-1 relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابحث عن منطقة، شارع، أو اسم سكن..."
                                    className="w-full py-4 pr-10 pl-4 text-gray-800 rounded-xl focus:outline-none text-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                            >
                                بحث
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* الإعلانات المميزة */}
            {featuredListings.length > 0 && (
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            إعلانات مميزة
                        </h2>
                        <Link
                            to="/search"
                            className="text-purple-600 hover:underline"
                        >
                            عرض الكل
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredListings.map((listing) => (
                            <ListingCard key={listing._id} listing={listing} />
                        ))}
                    </div>
                </div>
            )}

            {/* جميع الإعلانات */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    جميع الإعلانات
                </h2>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        لا توجد إعلانات حالياً
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map((listing) => (
                            <ListingCard key={listing._id} listing={listing} />
                        ))}
                    </div>
                )}
            </div>

            {/* التوصيات الذكية */}
            <div className="container mx-auto px-4">
                <SmartRecommendations />
            </div>

            {/* Footer */}
            <Footer />

            {/* المساعد الذكي */}
            <AIChatAssistant />
        </div>
    );
};

export default Home;
