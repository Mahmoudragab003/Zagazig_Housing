import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Building2, MapPin, Bed, Bath, Maximize, Heart, Trash2, Loader2 } from 'lucide-react';
import { getImageUrl } from '../config';

const Favorites = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) { navigate('/login'); return; }
        loadFavorites();
    }, []);

    const loadFavorites = () => {
        const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(saved);
        setLoading(false);
    };

    const removeFavorite = (id) => {
        const updated = favorites.filter(f => f._id !== id);
        localStorage.setItem('favorites', JSON.stringify(updated));
        setFavorites(updated);
    };

    const ListingCard = ({ listing }) => (
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
            <div className="relative h-48 bg-gradient-to-br from-purple-400 to-indigo-600">
                {listing.images?.[0] ? <img src={getImageUrl(listing.images[0])} alt={listing.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-16 h-16 text-white/50" /></div>}
                <div className="absolute top-3 right-3"><span className={`px-3 py-1 rounded-full text-xs font-medium ${listing.type === 'rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>{listing.type === 'rent' ? 'للإيجار' : 'للبيع'}</span></div>
                <button onClick={() => removeFavorite(listing._id)} className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-lg"><Heart className="w-4 h-4 fill-current" /></button>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{listing.title}</h3>
                <div className="flex items-center text-gray-500 text-sm mb-3"><MapPin className="w-4 h-4 ml-1" />{listing.address?.district || 'الزقازيق'}</div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{listing.bedrooms}</span>
                    <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{listing.bathrooms}</span>
                    <span className="flex items-center gap-1"><Maximize className="w-4 h-4" />{listing.area} م²</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-purple-600">{listing.price?.toLocaleString()} <span className="text-sm text-gray-500">ج.م</span></span>
                    <Link to={`/listing/${listing._id}`} className="text-purple-600 text-sm font-medium hover:underline">عرض</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Heart className="w-8 h-8 text-red-500" />
                    <h1 className="text-2xl font-bold text-gray-800">الإعلانات المفضلة</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
                ) : favorites.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">لا توجد إعلانات مفضلة</h2>
                        <p className="text-gray-500 mb-6">ابدأ بإضافة إعلانات إلى قائمة المفضلة</p>
                        <Link to="/search" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg">
                            تصفح الإعلانات
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map(listing => <ListingCard key={listing._id} listing={listing} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
