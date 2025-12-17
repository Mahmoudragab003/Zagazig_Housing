/**
 * سياق المقارنة (Compare Context)
 * لإدارة قائمة الشقق المختارة للمقارنة
 */

import { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
    // قائمة الشقق المختارة للمقارنة (حد أقصى 2)
    const [compareList, setCompareList] = useState(() => {
        const saved = localStorage.getItem('compareList');
        return saved ? JSON.parse(saved) : [];
    });

    // حفظ القائمة في localStorage
    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    // إضافة شقة للمقارنة
    const addToCompare = (listing) => {
        if (compareList.length >= 2) {
            alert('يمكنك مقارنة شقتين فقط. احذف واحدة أولاً.');
            return false;
        }
        if (compareList.some(item => item._id === listing._id)) {
            return false; // موجودة بالفعل
        }
        setCompareList(prev => [...prev, listing]);
        return true;
    };

    // إزالة شقة من المقارنة
    const removeFromCompare = (listingId) => {
        setCompareList(prev => prev.filter(item => item._id !== listingId));
    };

    // التحقق إذا كانت الشقة في قائمة المقارنة
    const isInCompare = (listingId) => {
        return compareList.some(item => item._id === listingId);
    };

    // تفريغ القائمة
    const clearCompare = () => {
        setCompareList([]);
    };

    // تبديل حالة الشقة (إضافة/إزالة)
    const toggleCompare = (listing) => {
        if (isInCompare(listing._id)) {
            removeFromCompare(listing._id);
            return false;
        } else {
            return addToCompare(listing);
        }
    };

    return (
        <CompareContext.Provider value={{
            compareList,
            addToCompare,
            removeFromCompare,
            isInCompare,
            clearCompare,
            toggleCompare,
            canCompare: compareList.length === 2
        }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within CompareProvider');
    }
    return context;
};

export default CompareContext;
