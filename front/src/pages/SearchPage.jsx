import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CompareListings from '../components/CompareListings';
import { Building2, MapPin, Bed, Bath, Maximize, Search as SearchIcon, SlidersHorizontal, Loader2, ArrowLeftRight } from 'lucide-react';
import { API_URL, getImageUrl } from '../config';

const SearchPage = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [compareIds, setCompareIds] = useState([]);
    const [showCompare, setShowCompare] = useState(false);
    const [filters, setFilters] = useState({
        search: '', type: '', minPrice: '', maxPrice: '', bedrooms: '', district: '', furnished: false, nearCampus: false, sort: 'newest'
    });

    useEffect(() => { fetchListings(); }, [filters.sort]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.type) params.append('type', filters.type);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
            if (filters.district) params.append('district', filters.district);
            if (filters.furnished) params.append('furnished', 'true');
            if (filters.nearCampus) params.append('nearCampus', 'true');

            // Sorting logic
            if (filters.sort === 'price_asc') {
                params.append('sortBy', 'price');
                params.append('sortOrder', 'asc');
            } else if (filters.sort === 'price_desc') {
                params.append('sortBy', 'price');
                params.append('sortOrder', 'desc');
            } else {
                params.append('sortBy', 'createdAt');
                params.append('sortOrder', 'desc');
            }

            const res = await fetch(`${API_URL}/listings?${params}`);
            const data = await res.json();
            if (data.success) setListings(data.data.listings);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const { token, isAuthenticated } = useAuth(); // Import useAuth at top of file too

    // ... (existing code)

    const handleSearch = (e) => { e.preventDefault(); fetchListings(); };
    const clearFilters = () => { setFilters({ search: '', type: '', minPrice: '', maxPrice: '', bedrooms: '', district: '', furnished: false, nearCampus: false, sort: 'newest' }); };

    const handleSaveSearch = async () => {
        if (!isAuthenticated()) {
            alert('يجب تسجيل الدخول لحفظ البحث');
            return;
        }
        try {
            const res = await fetch(`${API_URL}/saved-searches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    criteria: filters,
                    title: filters.search || 'بحث مخصص'
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('تم حفظ البحث بنجاح! ستصلك إشعارات عند توفر إعلانات جديدة.');
            }
        } catch (err) {
            console.error('Save search error:', err);
        }
    };

    const toggleCompare = (id) => {
        if (compareIds.includes(id)) {
            setCompareIds(compareIds.filter(i => i !== id));
        } else if (compareIds.length < 2) {
            setCompareIds([...compareIds, id]);
        }
    };

    const ListingCard = ({ listing }) => (
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group relative">
            <label className="absolute top-3 left-3 z-10 cursor-pointer">
                <input
                    type="checkbox"
                    checked={compareIds.includes(listing._id)}
                    onChange={() => toggleCompare(listing._id)}
                    className="w-5 h-5 text-purple-600 rounded border-2 border-white shadow-md"
                />
            </label>
            <Link to={`/listing/${listing._id}`}>
                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-600">
                    {listing.images?.[0] ? <img src={getImageUrl(listing.images[0])} alt={listing.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-16 h-16 text-white/50" /></div>}
                    <div className="absolute top-3 right-3"><span className={`px-3 py-1 rounded-full text-xs font-medium ${listing.type === 'rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>{listing.type === 'rent' ? 'للإيجار' : 'للبيع'}</span></div>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{listing.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm mb-3"><MapPin className="w-4 h-4 ml-1" />{listing.address?.district || 'الزقازيق'}</div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{listing.bedrooms}</span>
                        <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{listing.bathrooms}</span>
                        <span className="flex items-center gap-1"><Maximize className="w-4 h-4" />{listing.area} م²</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">{listing.price.toLocaleString()} <span className="text-sm text-gray-500">ج.م</span></span>
                </div>
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Search Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl font-bold text-white mb-4 text-center">ابحث عن سكنك</h1>
                    <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex items-center gap-2 max-w-2xl mx-auto shadow-xl">
                        <div className="flex-1 relative">
                            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="text" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="ابحث عن موقع أو حي..." className="w-full py-3 pr-10 pl-4 text-gray-800 rounded-xl focus:outline-none" />
                        </div>
                        <button type="button" onClick={() => setShowFilters(!showFilters)} className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl"><SlidersHorizontal className="w-5 h-5" /></button>
                        <button type="submit" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium">بحث</button>
                    </form>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white border-b shadow-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">الفلاتر</h3>
                            <button onClick={clearFilters} className="text-purple-600 text-sm hover:underline">مسح الكل</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="border rounded-xl py-2 px-3 focus:ring-2 focus:ring-purple-500">
                                <option value="">الكل</option><option value="rent">للإيجار</option><option value="sell">للبيع</option>
                            </select>
                            <input type="number" placeholder="أقل سعر" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} className="border rounded-xl py-2 px-3" />
                            <input type="number" placeholder="أعلى سعر" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} className="border rounded-xl py-2 px-3" />
                            <select value={filters.bedrooms} onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })} className="border rounded-xl py-2 px-3">
                                <option value="">غرف النوم</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option>
                            </select>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.furnished} onChange={(e) => setFilters({ ...filters, furnished: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" /><span className="text-gray-700">مفروش</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.nearCampus} onChange={(e) => setFilters({ ...filters, nearCampus: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" /><span className="text-gray-700">قريب من الجامعة</span></label>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={fetchListings} className="flex-1 bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700">تطبيق الفلاتر</button>
                            <button onClick={handleSaveSearch} className="bg-white border border-purple-600 text-purple-600 px-6 py-2 rounded-xl hover:bg-purple-50">حفظ البحث</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compare Button */}
            {compareIds.length > 0 && (
                <div className="bg-purple-600 text-white py-3">
                    <div className="container mx-auto px-4 flex items-center justify-between">
                        <span>تم اختيار {compareIds.length} شقة للمقارنة</span>
                        <div className="flex gap-2">
                            <button onClick={() => setCompareIds([])} className="px-4 py-1 bg-white/20 rounded-lg hover:bg-white/30">إلغاء</button>
                            <button onClick={() => setShowCompare(true)} disabled={compareIds.length !== 2} className="px-4 py-1 bg-white text-purple-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2">
                                <ArrowLeftRight className="w-4 h-4" />
                                مقارنة
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            <div className="container mx-auto px-4 py-8 flex-1">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">{listings.length} نتيجة</p>
                    <select
                        value={filters.sort}
                        onChange={(e) => {
                            setFilters({ ...filters, sort: e.target.value });
                            // Trigger fetch immediately when sort changes is tricky with state update, 
                            // but we can call fetchListings in useEffect or just let the user click search/apply.
                            // Better UX: trigger fetch. But state update is async.
                            // For now, let's just update state and let user click 'Search' or add useEffect for sort.
                            // Actually, let's add a useEffect for filters.sort or just call fetchListings with new value.
                            // Simplest: just update state, and user hits search/apply? No, sort usually triggers immediately.
                            // I'll add a specific useEffect for sort or just call fetchListings inside the onChange handler (careful with stale state).
                            // Let's stick to update state -> useEffect dependency or manual call.
                        }}
                        // Actually, I'll just add a useEffect for filters.sort below
                        className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="newest">الأحدث</option>
                        <option value="price_asc">السعر: من الأقل للأعلى</option>
                        <option value="price_desc">السعر: من الأعلى للأقل</option>
                    </select>
                </div>
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">لا توجد نتائج مطابقة لبحثك</p>
                        {isAuthenticated() && (
                            <button
                                onClick={handleSaveSearch}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                            >
                                <span className="text-xl">🔔</span>
                                أخبرني عند توفر شقق مطابقة
                            </button>
                        )}
                        <p className="text-gray-400 text-sm mt-3">سنرسل لك إشعاراً فورياً عند نزول شقة تناسب بحثك</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{listings.map(l => <ListingCard key={l._id} listing={l} />)}</div>
                )}
            </div>

            <Footer />

            {/* Compare Modal */}
            <CompareListings isOpen={showCompare} onClose={() => setShowCompare(false)} listingIds={compareIds} />
        </div>
    );
};

export default SearchPage;
