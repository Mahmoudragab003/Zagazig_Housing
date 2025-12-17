/**
 * شريط المقارنة العائم (Floating Compare Bar)
 * يظهر في أسفل الشاشة عند إضافة شقق للمقارنة
 */

import { useState } from 'react';
import { useCompare } from '../context/CompareContext';
import CompareListings from './CompareListings';
import { ArrowLeftRight, X, Building2 } from 'lucide-react';
import { getImageUrl } from '../config';

const CompareBar = () => {
    const { compareList, removeFromCompare, clearCompare, canCompare } = useCompare();
    const [showCompareModal, setShowCompareModal] = useState(false);

    // لا تظهر إذا كانت القائمة فارغة
    if (compareList.length === 0) return null;

    return (
        <>
            {/* Floating Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-2xl z-40 animate-slide-up">
                <div className="container mx-auto flex items-center justify-between">
                    {/* الشقق المختارة */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <ArrowLeftRight className="w-5 h-5" />
                            <span className="font-medium">المقارنة ({compareList.length}/2)</span>
                        </div>

                        <div className="flex gap-3">
                            {compareList.map(listing => (
                                <div
                                    key={listing._id}
                                    className="flex items-center gap-2 bg-white/20 rounded-lg p-2 pr-3"
                                >
                                    {listing.images?.[0] ? (
                                        <img
                                            src={getImageUrl(listing.images[0])}
                                            alt=""
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded bg-white/20 flex items-center justify-center">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                    )}
                                    <span className="text-sm max-w-[150px] truncate">
                                        {listing.title}
                                    </span>
                                    <button
                                        onClick={() => removeFromCompare(listing._id)}
                                        className="p-1 hover:bg-white/20 rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* الأزرار */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={clearCompare}
                            className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            مسح الكل
                        </button>
                        <button
                            onClick={() => setShowCompareModal(true)}
                            disabled={!canCompare}
                            className={`px-6 py-2 rounded-xl font-medium transition-all ${canCompare
                                    ? 'bg-white text-purple-600 hover:shadow-lg'
                                    : 'bg-white/30 text-white/60 cursor-not-allowed'
                                }`}
                        >
                            قارن الآن
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal المقارنة */}
            <CompareListings
                isOpen={showCompareModal}
                onClose={() => setShowCompareModal(false)}
                listingIds={compareList.map(l => l._id)}
            />

            {/* CSS للـ Animation */}
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default CompareBar;
