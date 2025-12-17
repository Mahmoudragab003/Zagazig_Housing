/**
 * مكون التوصيات الذكية (Smart Recommendations)
 * يعرض شقق مقترحة بناءً على سلوك المستخدم
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Bed, Bath, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { API_URL, getImageUrl } from '../config';

const SmartRecommendations = ({ title = 'قد يعجبك أيضاً', type = 'recommendations' }) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendationType, setRecommendationType] = useState('trending');

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            // جلب سجل المشاهدة والمفضلة من localStorage
            const viewHistory = JSON.parse(localStorage.getItem('viewHistory') || '[]');
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

            const params = new URLSearchParams();
            if (viewHistory.length > 0) {
                params.append('viewHistory', viewHistory.slice(-10).join(','));
            }
            if (favorites.length > 0) {
                params.append('favorites', favorites.join(','));
            }

            const endpoint = type === 'trending'
                ? `${API_URL}/ai/trending`
                : `${API_URL}/ai/recommendations?${params}`;

            const res = await fetch(endpoint);
            const data = await res.json();

            if (data.success) {
                setListings(data.data.listings || []);
                setRecommendationType(data.data.type || 'trending');
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (listings.length === 0) {
        return null;
    }

    return (
        <div className="py-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                {recommendationType === 'personalized' ? (
                    <Sparkles className="w-6 h-6 text-purple-500" />
                ) : (
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                )}
                <h2 className="text-xl font-bold text-gray-800">
                    {recommendationType === 'personalized' ? 'مقترحات لك' : 'الشقق الرائجة'}
                </h2>
                {recommendationType === 'personalized' && (
                    <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                        بناءً على تفضيلاتك
                    </span>
                )}
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                    <Link
                        key={listing._id}
                        to={`/listing/${listing._id}`}
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
                    >
                        {/* Image */}
                        <div className="relative h-40 bg-gradient-to-br from-purple-400 to-indigo-600">
                            {listing.images?.[0] ? (
                                <img
                                    src={getImageUrl(listing.images[0])}
                                    alt={listing.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Building2 className="w-12 h-12 text-white/50" />
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${listing.type === 'rent'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-green-500 text-white'
                                    }`}>
                                    {listing.type === 'rent' ? 'للإيجار' : 'للبيع'}
                                </span>
                            </div>
                            {listing.isFeatured && (
                                <div className="absolute top-3 left-3">
                                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        مميز
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">
                                {listing.title}
                            </h3>
                            <div className="flex items-center text-gray-500 text-sm mb-3">
                                <MapPin className="w-4 h-4 ml-1" />
                                {listing.address?.district || 'الزقازيق'}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                    <Bed className="w-4 h-4" />
                                    {listing.bedrooms}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Bath className="w-4 h-4" />
                                    {listing.bathrooms}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-purple-600">
                                    {listing.price?.toLocaleString()}
                                    <span className="text-sm text-gray-500 mr-1">ج.م</span>
                                </span>
                                {listing.viewCount > 10 && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {listing.viewCount} مشاهدة
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SmartRecommendations;
