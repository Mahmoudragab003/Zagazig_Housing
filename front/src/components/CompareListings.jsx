/**
 * مكون مقارنة الشقق
 * يسمح بمقارنة شقتين جنب بعض
 */

import { useState, useEffect } from 'react';
import { X, Building2, CheckCircle, XCircle, ArrowLeftRight } from 'lucide-react';
import { API_URL, getImageUrl } from '../config';

const CompareListings = ({ isOpen, onClose, listingIds }) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && listingIds.length === 2) {
            fetchListings();
        }
    }, [isOpen, listingIds]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const promises = listingIds.map(id =>
                fetch(`${API_URL}/listings/${id}`).then(res => res.json())
            );
            const results = await Promise.all(promises);
            setListings(results.filter(r => r.success).map(r => r.data.listing));
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    const amenitiesLabels = {
        furnished: 'مفروشة',
        airConditioning: 'تكييف',
        heating: 'تدفئة',
        wifi: 'واي فاي',
        parking: 'موقف سيارات',
        elevator: 'مصعد',
        balcony: 'بلكونة',
        security: 'أمن',
        kitchen: 'مطبخ',
        washingMachine: 'غسالة'
    };

    const CompareRow = ({ label, values, highlight = false }) => (
        <tr className={highlight ? 'bg-purple-50' : ''}>
            <td className="py-3 px-4 font-medium text-gray-700">{label}</td>
            {values.map((val, idx) => (
                <td key={idx} className="py-3 px-4 text-center">{val}</td>
            ))}
        </tr>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ArrowLeftRight className="w-6 h-6" />
                        <h2 className="text-xl font-bold">مقارنة الشقق</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : listings.length !== 2 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>اختر شقتين للمقارنة</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-4 px-4 text-right font-semibold text-gray-600 w-1/4"></th>
                                    <th className="py-4 px-4 text-center">
                                        <img
                                            src={getImageUrl(listings[0].images?.[0]) || '/placeholder.jpg'}
                                            alt=""
                                            className="w-24 h-24 object-cover rounded-xl mx-auto mb-2"
                                        />
                                        <span className="font-bold text-gray-800">{listings[0].title.substring(0, 20)}...</span>
                                    </th>
                                    <th className="py-4 px-4 text-center">
                                        <img
                                            src={getImageUrl(listings[1].images?.[0]) || '/placeholder.jpg'}
                                            alt=""
                                            className="w-24 h-24 object-cover rounded-xl mx-auto mb-2"
                                        />
                                        <span className="font-bold text-gray-800">{listings[1].title.substring(0, 20)}...</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <CompareRow
                                    label="السعر"
                                    values={listings.map(l => <span className="text-purple-600 font-bold">{l.price.toLocaleString()} ج.م</span>)}
                                    highlight
                                />
                                <CompareRow
                                    label="النوع"
                                    values={listings.map(l => l.type === 'rent' ? 'للإيجار' : 'للبيع')}
                                />
                                <CompareRow
                                    label="المساحة"
                                    values={listings.map(l => `${l.area} م²`)}
                                />
                                <CompareRow
                                    label="غرف النوم"
                                    values={listings.map(l => l.bedrooms)}
                                />
                                <CompareRow
                                    label="الحمامات"
                                    values={listings.map(l => l.bathrooms)}
                                />
                                <CompareRow
                                    label="الموقع"
                                    values={listings.map(l => l.address?.district || '-')}
                                    highlight
                                />
                                {Object.entries(amenitiesLabels).map(([key, label]) => (
                                    <CompareRow
                                        key={key}
                                        label={label}
                                        values={listings.map(l =>
                                            l.amenities?.[key]
                                                ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                                                : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                                        )}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompareListings;
