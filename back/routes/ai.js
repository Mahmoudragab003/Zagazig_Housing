/**
 * مسارات الذكاء الاصطناعي (AI Routes)
 * البحث الذكي والتوصيات
 */

const express = require('express');
const Listing = require('../models/Listing');
const { protect, optionalAuth } = require('../middleware/auth');
const { parseNaturalQuery, generateSmartResponse, getSearchSuggestions } = require('../utils/aiSearchService');
const { getSimilarListings, getPersonalizedRecommendations, getTrendingListings } = require('../utils/recommendationService');
const { parseSearchQuery, generateSmartReply, answerGeneralQuestion, isGeminiAvailable } = require('../utils/geminiService');

const router = express.Router();

/**
 * @route   POST /api/ai/smart-search
 * @desc    البحث باللغة الطبيعية (مع Gemini إذا متاح)
 * @access  Public
 */
router.post('/smart-search', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || query.trim().length === 0) {
            return res.json({
                success: true,
                data: {
                    message: 'مرحباً! 👋 أنا المساعد الذكي لسكن الزقازيق. اسألني عن أي شقة تبحث عنها!',
                    suggestions: getSearchSuggestions(),
                    listings: [],
                    filters: {},
                    aiPowered: isGeminiAvailable()
                }
            });
        }

        const queryLower = query.toLowerCase();

        // كلمات متعلقة بالبحث عن شقق
        const searchKeywords = [
            'شقة', 'شقه', 'سكن', 'غرف', 'غرفة', 'اوض', 'أوض',
            'إيجار', 'ايجار', 'اجار', 'بيع', 'شراء',
            'جنيه', 'ج.م', 'سعر', 'فلوس', 'ميزانية',
            'منطقة', 'حي', 'شارع', 'الزقازيق', 'الشرقية', 'الناصرية', 'القومية', 'الجامعة',
            'مفروش', 'فرش', 'تكييف', 'بلكونة',
            'قريب', 'بعيد', 'دور', 'طابق',
            'استديو', 'روف', 'دوبلكس',
            'apartment', 'rent', 'room', 'furnished'
        ];

        // التحقق إذا كان السؤال يحتوي على كلمات بحث
        const isSearchQuery = searchKeywords.some(keyword => queryLower.includes(keyword));

        // إذا مش بحث عن شقة، يبقى سؤال عام
        if (!isSearchQuery) {
            let response = '';

            // استخدام Gemini للرد الذكي
            if (isGeminiAvailable()) {
                const geminiAnswer = await answerGeneralQuestion(query);
                if (geminiAnswer) {
                    response = geminiAnswer;
                }
            }

            // استخدام الردود المحلية الذكية (شكراً، تمام، إلخ)
            if (!response) {
                const localResponse = generateSmartResponse(query);
                if (localResponse?.message) {
                    response = localResponse.message;
                }
            }

            // fallback response عام
            if (!response) {
                response = 'أهلاً! 👋 محتاج مساعدة في البحث عن شقة؟ قولي بتدور على إيه!';
            }

            return res.json({
                success: true,
                data: {
                    message: response,
                    suggestions: getSearchSuggestions(),
                    listings: [],
                    filters: {},
                    aiPowered: isGeminiAvailable(),
                    isGeneralResponse: true
                }
            });
        }

        // البحث عن شقق - استخدام Gemini أو المحلل المحلي
        let filters = {};
        let understanding = '';

        if (isGeminiAvailable()) {
            const geminiResult = await parseSearchQuery(query);
            if (geminiResult) {
                filters = geminiResult.filters;
                understanding = geminiResult.understanding;
            }
        }

        // Fallback للتحليل المحلي
        if (Object.keys(filters).every(k => !filters[k])) {
            const localResult = parseNaturalQuery(query);
            filters = localResult.filters;
            understanding = localResult.understanding;
        }

        // بناء query للبحث
        const dbQuery = { status: 'active' };

        if (filters.type) dbQuery.type = filters.type;
        if (filters.district) dbQuery['address.district'] = { $regex: filters.district, $options: 'i' };
        if (filters.maxPrice) dbQuery.price = { ...(dbQuery.price || {}), $lte: filters.maxPrice };
        if (filters.minPrice) dbQuery.price = { ...(dbQuery.price || {}), $gte: filters.minPrice };
        if (filters.bedrooms) dbQuery.bedrooms = { $gte: filters.bedrooms };
        if (filters.furnished) dbQuery['amenities.furnished'] = true;
        if (filters.nearCampus) dbQuery['studentFriendly.nearCampus'] = true;

        // البحث في قاعدة البيانات
        const listings = await Listing.find(dbQuery)
            .populate('vendor', 'firstName lastName phone')
            .sort({ isFeatured: -1, createdAt: -1 })
            .limit(12);

        // توليد الرد الذكي
        let message = understanding;

        if (isGeminiAvailable()) {
            const geminiReply = await generateSmartReply(query, listings.length, listings);
            if (geminiReply) {
                message = geminiReply;
            }
        } else {
            const smartResponse = generateSmartResponse(query, listings.length);
            if (smartResponse?.message) {
                message = smartResponse.message;
            }
        }

        res.json({
            success: true,
            data: {
                message,
                understanding,
                filters,
                listings,
                count: listings.length,
                suggestions: getSearchSuggestions(filters),
                aiPowered: isGeminiAvailable()
            }
        });
    } catch (error) {
        console.error('Smart search error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في البحث الذكي'
        });
    }
});

/**
 * @route   GET /api/ai/suggestions
 * @desc    اقتراحات البحث
 * @access  Public
 */
router.get('/suggestions', (req, res) => {
    const filters = req.query;
    res.json({
        success: true,
        data: getSearchSuggestions(filters)
    });
});

/**
 * @route   GET /api/ai/similar/:listingId
 * @desc    شقق مشابهة
 * @access  Public
 */
router.get('/similar/:listingId', async (req, res) => {
    try {
        const listings = await getSimilarListings(req.params.listingId, 4);

        res.json({
            success: true,
            data: { listings }
        });
    } catch (error) {
        console.error('Similar listings error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الشقق المشابهة'
        });
    }
});

/**
 * @route   GET /api/ai/recommendations
 * @desc    توصيات مخصصة للمستخدم
 * @access  Private
 */
router.get('/recommendations', optionalAuth, async (req, res) => {
    try {
        // جلب سجل المشاهدة والمفضلة من localStorage عبر الـ query
        const viewHistory = req.query.viewHistory ? req.query.viewHistory.split(',') : [];
        const favorites = req.query.favorites ? req.query.favorites.split(',') : [];

        let listings;

        if (viewHistory.length > 0 || favorites.length > 0) {
            listings = await getPersonalizedRecommendations(
                req.user?._id,
                viewHistory,
                favorites,
                6
            );
        } else {
            // للمستخدمين الجدد، نعرض الرائج
            listings = await getTrendingListings(6);
        }

        res.json({
            success: true,
            data: {
                listings,
                type: viewHistory.length > 0 || favorites.length > 0 ? 'personalized' : 'trending'
            }
        });
    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب التوصيات'
        });
    }
});

/**
 * @route   GET /api/ai/trending
 * @desc    الشقق الرائجة
 * @access  Public
 */
router.get('/trending', async (req, res) => {
    try {
        const listings = await getTrendingListings(6);

        res.json({
            success: true,
            data: { listings }
        });
    } catch (error) {
        console.error('Trending listings error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الشقق الرائجة'
        });
    }
});

module.exports = router;
