/**
 * خدمة التوصيات الذكية (Smart Recommendations Service)
 * توصية شقق بناءً على سلوك المستخدم وتفضيلاته
 */

const Listing = require('../models/Listing');

/**
 * حساب درجة التشابه بين إعلانين
 */
const calculateSimilarity = (listing1, listing2) => {
    let score = 0;

    // نفس النوع (إيجار/بيع)
    if (listing1.type === listing2.type) score += 30;

    // نفس المنطقة
    if (listing1.address?.district === listing2.address?.district) score += 25;

    // سعر قريب (±30%)
    const priceDiff = Math.abs(listing1.price - listing2.price) / listing1.price;
    if (priceDiff <= 0.1) score += 20;
    else if (priceDiff <= 0.2) score += 15;
    else if (priceDiff <= 0.3) score += 10;

    // عدد غرف متقارب
    const bedroomDiff = Math.abs(listing1.bedrooms - listing2.bedrooms);
    if (bedroomDiff === 0) score += 15;
    else if (bedroomDiff === 1) score += 10;

    // مميزات مشتركة
    if (listing1.amenities?.furnished === listing2.amenities?.furnished) score += 5;
    if (listing1.studentFriendly?.nearCampus === listing2.studentFriendly?.nearCampus) score += 5;

    return score;
};

/**
 * الحصول على شقق مشابهة
 */
const getSimilarListings = async (listingId, limit = 4) => {
    try {
        const currentListing = await Listing.findById(listingId);
        if (!currentListing) return [];

        // جلب شقق نشطة أخرى
        const allListings = await Listing.find({
            _id: { $ne: listingId },
            status: 'active'
        }).populate('vendor', 'firstName lastName');

        // حساب التشابه وترتيب
        const scoredListings = allListings.map(listing => ({
            listing,
            score: calculateSimilarity(currentListing, listing)
        }));

        scoredListings.sort((a, b) => b.score - a.score);

        return scoredListings.slice(0, limit).map(s => s.listing);
    } catch (error) {
        console.error('Error getting similar listings:', error);
        return [];
    }
};

/**
 * توصيات بناءً على تفضيلات المستخدم
 */
const getPersonalizedRecommendations = async (userId, viewHistory = [], favorites = [], limit = 6) => {
    try {
        // تحليل التفضيلات من التاريخ والمفضلة
        const preferences = await analyzeUserPreferences(viewHistory, favorites);

        // بناء query بناءً على التفضيلات
        const query = { status: 'active' };

        if (preferences.preferredType) {
            query.type = preferences.preferredType;
        }

        if (preferences.preferredDistricts?.length > 0) {
            query['address.district'] = { $in: preferences.preferredDistricts };
        }

        if (preferences.avgPrice) {
            query.price = {
                $gte: preferences.avgPrice * 0.7,
                $lte: preferences.avgPrice * 1.3
            };
        }

        if (preferences.avgBedrooms) {
            query.bedrooms = {
                $gte: Math.max(1, preferences.avgBedrooms - 1),
                $lte: preferences.avgBedrooms + 1
            };
        }

        // استثناء ما شاهده بالفعل
        if (viewHistory.length > 0) {
            query._id = { $nin: viewHistory };
        }

        const recommendations = await Listing.find(query)
            .populate('vendor', 'firstName lastName')
            .sort({ isFeatured: -1, viewCount: -1 })
            .limit(limit);

        // إذا لم نجد كفاية، نضيف شقق مميزة
        if (recommendations.length < limit) {
            const featured = await Listing.find({
                status: 'active',
                _id: { $nin: [...viewHistory, ...recommendations.map(r => r._id)] }
            })
                .populate('vendor', 'firstName lastName')
                .sort({ isFeatured: -1, createdAt: -1 })
                .limit(limit - recommendations.length);

            recommendations.push(...featured);
        }

        return recommendations;
    } catch (error) {
        console.error('Error getting personalized recommendations:', error);
        return [];
    }
};

/**
 * تحليل تفضيلات المستخدم
 */
const analyzeUserPreferences = async (viewHistory, favorites) => {
    const preferences = {
        preferredType: null,
        preferredDistricts: [],
        avgPrice: null,
        avgBedrooms: null
    };

    const allIds = [...new Set([...viewHistory, ...favorites])];
    if (allIds.length === 0) return preferences;

    try {
        const listings = await Listing.find({ _id: { $in: allIds } });

        if (listings.length === 0) return preferences;

        // حساب النوع الأكثر تفضيلاً
        const typeCounts = { rent: 0, sell: 0 };
        listings.forEach(l => typeCounts[l.type]++);
        preferences.preferredType = typeCounts.rent >= typeCounts.sell ? 'rent' : 'sell';

        // المناطق المفضلة
        const districtCounts = {};
        listings.forEach(l => {
            if (l.address?.district) {
                districtCounts[l.address.district] = (districtCounts[l.address.district] || 0) + 1;
            }
        });
        preferences.preferredDistricts = Object.entries(districtCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([district]) => district);

        // متوسط السعر
        const prices = listings.map(l => l.price).filter(p => p);
        if (prices.length > 0) {
            preferences.avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
        }

        // متوسط الغرف
        const bedrooms = listings.map(l => l.bedrooms).filter(b => b);
        if (bedrooms.length > 0) {
            preferences.avgBedrooms = Math.round(bedrooms.reduce((a, b) => a + b, 0) / bedrooms.length);
        }

        return preferences;
    } catch (error) {
        console.error('Error analyzing preferences:', error);
        return preferences;
    }
};

/**
 * الشقق الرائجة
 */
const getTrendingListings = async (limit = 6) => {
    try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        return await Listing.find({
            status: 'active',
            $or: [
                { createdAt: { $gte: weekAgo } },
                { viewCount: { $gte: 10 } }
            ]
        })
            .populate('vendor', 'firstName lastName')
            .sort({ viewCount: -1, createdAt: -1 })
            .limit(limit);
    } catch (error) {
        console.error('Error getting trending listings:', error);
        return [];
    }
};

module.exports = {
    getSimilarListings,
    getPersonalizedRecommendations,
    getTrendingListings,
    analyzeUserPreferences
};
