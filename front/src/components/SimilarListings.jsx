/**
 * مكون الشقق المشابهة (Similar Listings)
 * يظهر في صفحة تفاصيل الشقة
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Bed, Loader2 } from 'lucide-react';
import { API_URL, getImageUrl } from '../config';

const SimilarListings = ({ listingId }) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (listingId) {
            fetchSimilarListings();
        }
    }, [listingId]);

    const fetchSimilarListings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/ai/similar/${listingId}`);
            const data = await res.json();

            if (data.success) {
                setListings(data.data.listings || []);
            }
        } catch (error) {
            console.error('Error fetching similar listings:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (listings.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-500" />
                شقق مشابهة
            </h3>

            <div className="space-y-4">
                {listings.map((listing) => (
                    <Link
                        key={listing._id}
                        to={`/listing/${listing._id}`}
                        className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        {/* الصورة */}
                        {listing.images?.[0] ? (
                            <img
                                src={getImageUrl(listing.images[0])}
                                alt={listing.title}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-8 h-8 text-purple-300" />
                            </div>
                        )}

                        {/* المعلومات */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
                                {listing.title}
                            </h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                                <MapPin className="w-3 h-3" />
                                {listing.address?.district || 'الزقازيق'}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-purple-600">
                                    {listing.price?.toLocaleString()} ج.م
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Bed className="w-3 h-3" />
                                    {listing.bedrooms} غرف
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SimilarListings;
