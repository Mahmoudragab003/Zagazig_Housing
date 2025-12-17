/**
 * خدمة الذكاء الاصطناعي للبحث (AI Search Service)
 * تحويل الأسئلة الطبيعية لفلاتر بحث
 */

/**
 * تحليل السؤال وتحويله لفلاتر
 */
const parseNaturalQuery = (query) => {
    const filters = {};
    const queryLower = query.toLowerCase();

    // استخراج نوع الإعلان (إيجار/بيع)
    if (queryLower.includes('إيجار') || queryLower.includes('ايجار') || queryLower.includes('للإيجار') || queryLower.includes('اجار')) {
        filters.type = 'rent';
    } else if (queryLower.includes('بيع') || queryLower.includes('للبيع') || queryLower.includes('شراء') || queryLower.includes('اشتري')) {
        filters.type = 'sell';
    }

    // استخراج السعر
    const pricePatterns = [
        /(?:أقل من|اقل من|تحت|أرخص من|ارخص من)\s*(\d+)/,
        /(\d+)\s*(?:جنيه|ج\.م|جم)/,
        /(?:ميزانية|budget)\s*(\d+)/,
        /(?:سعر|بسعر)\s*(\d+)/
    ];

    for (const pattern of pricePatterns) {
        const match = query.match(pattern);
        if (match) {
            filters.maxPrice = parseInt(match[1]);
            break;
        }
    }

    // استخراج عدد الغرف
    const bedroomPatterns = [
        /(\d+)\s*(?:غرف|غرفة|غرف نوم|أوض|اوض)/,
        /(?:غرف|غرفة)\s*(\d+)/,
        /(\d+)\s*(?:bedroom|bed|room)/i
    ];

    for (const pattern of bedroomPatterns) {
        const match = query.match(pattern);
        if (match) {
            filters.bedrooms = parseInt(match[1]);
            break;
        }
    }

    // استخراج المنطقة
    const districts = [
        'الشرقية', 'الزقازيق', 'القومية', 'الناصرية', 'الجامعة',
        'أحياء', 'المنصورة', 'محطة', 'شارع المحافظة', 'الاستاد',
        'النحال', 'الحسينية', 'فاقوس', 'ابو حماد', 'بلبيس'
    ];

    for (const district of districts) {
        if (queryLower.includes(district.toLowerCase())) {
            filters.district = district;
            break;
        }
    }

    // استخراج المميزات
    if (queryLower.includes('مفروش') || queryLower.includes('فرش') || queryLower.includes('furnished')) {
        filters.furnished = true;
    }

    if (queryLower.includes('قريب') && (queryLower.includes('جامع') || queryLower.includes('كلية') || queryLower.includes('campus'))) {
        filters.nearCampus = true;
    }

    // رسائل الفهم
    const understanding = [];
    if (filters.type) understanding.push(filters.type === 'rent' ? 'للإيجار' : 'للبيع');
    if (filters.maxPrice) understanding.push(`سعر أقل من ${filters.maxPrice.toLocaleString()} جنيه`);
    if (filters.bedrooms) understanding.push(`${filters.bedrooms} غرف نوم`);
    if (filters.district) understanding.push(`في منطقة ${filters.district}`);
    if (filters.furnished) understanding.push('مفروشة');
    if (filters.nearCampus) understanding.push('قريبة من الجامعة');

    return {
        filters,
        understanding: understanding.length > 0
            ? `فهمت! أنت تبحث عن شقة: ${understanding.join('، ')}`
            : 'أخبرني أكثر عن الشقة اللي بتدور عليها (المنطقة، السعر، عدد الغرف...)'
    };
};

/**
 * توليد ردود ذكية - Fallback محلي عندما لا يكون Gemini متاحاً
 */
const generateSmartResponse = (query, resultsCount) => {
    const queryLower = query.toLowerCase();

    // شكر وتقدير
    if (queryLower.includes('شكر') || queryLower.includes('شكراً') || queryLower.includes('مرسي') ||
        queryLower.includes('thanks') || queryLower.includes('thank') || queryLower.includes('ربنا يخليك') ||
        queryLower.includes('جزاك الله')) {
        const thankResponses = [
            'العفو يا صاحبي! 😊 لو محتاج أي حاجة تانية قولي',
            'ولا يهمك! 💙 أنا هنا لو احتجت مساعدة تانية',
            'العفو خالص! 🙌 لو عايز تسأل عن أي شقة أنا موجود',
            'لا شكر على واجب! 😊 محتاج حاجة تانية؟',
            'آمين يارب! 🌟 أنا هنا لو احتجت مساعدة'
        ];
        return {
            type: 'thanks',
            message: thankResponses[Math.floor(Math.random() * thankResponses.length)]
        };
    }

    // إيجابية وموافقة
    if (queryLower.includes('تمام') || queryLower.includes('حلو') || queryLower.includes('زي الفل') ||
        queryLower.includes('ممتاز') || queryLower.includes('جميل') || queryLower.includes('عظيم') ||
        queryLower.includes('اوكي') || queryLower.includes('ماشي') || queryLower.includes('طب') ||
        queryLower.includes('good') || queryLower.includes('great') || queryLower.includes('nice')) {
        const positiveResponses = [
            'تمام كده! 👍 لو محتاج أي مساعدة تانية في البحث عن شقة، قولي',
            'تمام! 😊 أقدر أساعدك في حاجة تانية؟',
            'ممتاز! 🙌 أنا هنا لو احتجت أي حاجة'
        ];
        return {
            type: 'positive',
            message: positiveResponses[Math.floor(Math.random() * positiveResponses.length)]
        };
    }

    // ردود على المدح
    if (queryLower.includes('شاطر') || queryLower.includes('برافو') || queryLower.includes('عاش') ||
        queryLower.includes('جامد') || queryLower.includes('كويس') || queryLower.includes('ذكي') ||
        queryLower.includes('أحسن بوت') || queryLower.includes('رائع')) {
        const complimentResponses = [
            'ميرسي أوي! 🥰 بحاول أساعدك على قد ما أقدر. إيه تاني أقدر أساعدك فيه؟',
            'شكراً! 😊 بحاول أكون مفيد قد ما أقدر',
            'ميرسي يا صاحبي! 💙 محتاج مساعدة في حاجة تانية؟'
        ];
        return {
            type: 'compliment',
            message: complimentResponses[Math.floor(Math.random() * complimentResponses.length)]
        };
    }

    // ترحيب
    if (queryLower.includes('مرحب') || queryLower.includes('السلام') || queryLower.includes('هاي') ||
        queryLower.includes('أهل') || queryLower.includes('ازيك') || queryLower.includes('عامل ايه') ||
        queryLower.includes('hello') || queryLower.includes('hi ') || queryLower === 'hi') {
        const greetingResponses = [
            'أهلاً وسهلاً! 👋 عايز تدور على شقة؟ قولي بتدور على إيه وأنا هساعدك!',
            'هلا والله! 😊 بتدور على شقة؟ أنا هنا أساعدك',
            'أهلاً بيك! 🏠 إيه الشقة اللي بتدور عليها؟'
        ];
        return {
            type: 'greeting',
            message: greetingResponses[Math.floor(Math.random() * greetingResponses.length)]
        };
    }

    // صباح/مساء الخير
    if (queryLower.includes('صباح الخير') || queryLower.includes('صباح النور') ||
        queryLower.includes('مساء الخير') || queryLower.includes('مساء النور')) {
        const timeGreetings = [
            'صباح النور! ☀️ محتاج مساعدة في البحث عن شقة؟',
            'مساء الفل! 🌙 بتدور على شقة؟ قولي وأنا هساعدك'
        ];
        const isEvening = queryLower.includes('مساء');
        return {
            type: 'time_greeting',
            message: isEvening ? timeGreetings[1] : timeGreetings[0]
        };
    }

    // وداع
    if (queryLower.includes('باي') || queryLower.includes('سلام') || queryLower.includes('مع السلامه') ||
        queryLower.includes('bye') || queryLower.includes('goodbye')) {
        const farewellResponses = [
            'مع السلامة! 👋 ارجعلي لو محتاج أي حاجة',
            'باي باي! 😊 أتمنى تلاقي الشقة المناسبة',
            'في أمان الله! 🏠 أنا هنا لو احتجت مساعدة'
        ];
        return {
            type: 'farewell',
            message: farewellResponses[Math.floor(Math.random() * farewellResponses.length)]
        };
    }

    // أسئلة عن البوت
    if (queryLower.includes('اسمك') || queryLower.includes('انت مين') || queryLower.includes('مين انت')) {
        return {
            type: 'identity',
            message: 'أنا مساعد سكن الزقازيق 🏠 بساعدك تلاقي شقة حلوة قريبة من الجامعة!'
        };
    }

    if (queryLower.includes('روبوت') || queryLower.includes('بوت') || queryLower.includes('آله') ||
        queryLower.includes('الة') || queryLower.includes('robot') || queryLower.includes('bot')) {
        return {
            type: 'bot_question',
            message: 'أيوه أنا بوت ذكي 🤖 بس بحاول أساعدك زي البني آدمين! عايز تدور على شقة؟'
        };
    }

    if (queryLower.includes('بتعمل ايه') || queryLower.includes('وظيفتك') || queryLower.includes('ممكن تساعدني')) {
        return {
            type: 'capability',
            message: 'أنا بساعدك تلاقي شقة مناسبة! 🏠 قولي بتدور على إيه (منطقة، سعر، عدد غرف) وأنا هساعدك'
        };
    }

    // مساعدة
    if (queryLower.includes('مساعد') || queryLower.includes('help') || queryLower.includes('ازاي') ||
        queryLower.includes('كيف') || queryLower.includes('ازاي ادور') || queryLower.includes('استخدم')) {
        return {
            type: 'help',
            message: `يمكنني مساعدتك في البحث! 🔍 جرب تقولي:
• "عايز شقة للإيجار في الزقازيق"
• "شقة مفروشة بـ 3000 جنيه"
• "غرفتين قريب من الجامعة"
• "أرخص شقة للبيع"`
        };
    }

    // أسئلة عن الأسعار
    if (queryLower.includes('الاسعار') || queryLower.includes('الأسعار') || queryLower.includes('كام') ||
        queryLower.includes('متوسط السعر') || queryLower.includes('أرخص') || queryLower.includes('ارخص')) {
        return {
            type: 'price_inquiry',
            message: 'الأسعار بتختلف حسب المنطقة والمساحة 💰 قولي ميزانيتك أو قول "شقة بـ 3000 جنيه" وأنا هدورلك!'
        };
    }

    // أسئلة عن المناطق
    if (queryLower.includes('انهي منطقة') || queryLower.includes('أفضل منطقة') || queryLower.includes('احسن منطقة') ||
        queryLower.includes('فين أسكن') || queryLower.includes('اسكن فين')) {
        return {
            type: 'area_advice',
            message: 'المناطق القريبة من الجامعة زي الناصرية والقومية مناسبة للطلاب! 🎓 عايز أدورلك على شقة في منطقة معينة؟'
        };
    }

    // أسئلة عن الموقع
    if (queryLower.includes('الموقع ده') || queryLower.includes('ايه ده') || queryLower.includes('بتشتغلوا ازاي')) {
        return {
            type: 'about',
            message: 'ده موقع سكن الزقازيق 🏠 منصة للبحث عن شقق قريبة من جامعة الزقازيق. قولي بتدور على إيه!'
        };
    }

    // شكوى عدم إيجاد شقة
    if (queryLower.includes('مش لاقي') || queryLower.includes('صعب') || queryLower.includes('مفيش')) {
        return {
            type: 'encouragement',
            message: 'متقلقش! 💪 جرب توسع البحث أو غير المنطقة. ممكن تحفظ البحث وهنبعتلك لما ينزل جديد!'
        };
    }

    // غالي
    if (queryLower.includes('غالي') || queryLower.includes('مش قادر') || queryLower.includes('فلوس كتير')) {
        return {
            type: 'price_concern',
            message: 'فاهمك! 💰 جرب تقولي ميزانيتك وأنا هدورلك على شقق مناسبة. ممكن نجرب مناطق تانية!'
        };
    }

    // مش فاهم
    if (queryLower.includes('مش فاهم') || queryLower.includes('موضحش') || queryLower.includes('ايه ده')) {
        return {
            type: 'clarification',
            message: 'معلش! 😊 ببساطة قولي بتدور على شقة فين وبكام وأنا هساعدك. مثلاً "شقة في الزقازيق بـ 3000"'
        };
    }

    // كلام سيء
    if (queryLower.includes('غبي') || queryLower.includes('وحش') || queryLower.includes('زفت')) {
        return {
            type: 'negative',
            message: 'معلش يا صاحبي! 😅 أنا بحاول أساعدك قد ما أقدر. جرب تقولي بتدور على إيه بالظبط'
        };
    }

    // رد على النتائج
    if (resultsCount !== undefined) {
        if (resultsCount === 0) {
            return {
                type: 'no_results',
                message: 'للأسف مش لاقي شقق تطابق بحثك دلوقتي 😔 جرب تغير بعض الفلاتر أو احفظ البحث وهنبلغك لما ينزل جديد!'
            };
        } else if (resultsCount <= 3) {
            return {
                type: 'few_results',
                message: `لقيتلك ${resultsCount} شقة بس! 🎯 لو عايز اختيارات أكتر، جرب توسع نطاق البحث.`
            };
        } else {
            return {
                type: 'results',
                message: `ممتاز! لقيتلك ${resultsCount} شقة تناسب بحثك 🏠✨`
            };
        }
    }

    // رد عام - catch all
    const fallbackResponses = [
        'أهلاً! 👋 محتاج مساعدة في البحث عن شقة؟ قولي بتدور على إيه!',
        'هلا! 😊 عايز تدور على شقة؟ قولي المنطقة والسعر اللي يناسبك',
        'أنا هنا أساعدك! 🏠 قولي بتدور على شقة إيجار ولا بيع؟'
    ];

    return {
        type: 'fallback',
        message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    };
};

/**
 * اقتراحات البحث الذكية
 */
const getSearchSuggestions = (currentFilters = {}) => {
    const suggestions = [];

    if (!currentFilters.type) {
        suggestions.push({ text: 'شقق للإيجار', filters: { type: 'rent' } });
        suggestions.push({ text: 'شقق للبيع', filters: { type: 'sell' } });
    }

    if (!currentFilters.nearCampus) {
        suggestions.push({ text: 'قريب من الجامعة', filters: { nearCampus: true } });
    }

    if (!currentFilters.maxPrice) {
        suggestions.push({ text: 'أقل من 3000 جنيه', filters: { maxPrice: 3000 } });
        suggestions.push({ text: 'أقل من 5000 جنيه', filters: { maxPrice: 5000 } });
    }

    if (!currentFilters.bedrooms) {
        suggestions.push({ text: 'غرفتين', filters: { bedrooms: 2 } });
        suggestions.push({ text: '3 غرف', filters: { bedrooms: 3 } });
    }

    if (!currentFilters.furnished) {
        suggestions.push({ text: 'مفروشة', filters: { furnished: true } });
    }

    return suggestions.slice(0, 4);
};

module.exports = {
    parseNaturalQuery,
    generateSmartResponse,
    getSearchSuggestions
};
