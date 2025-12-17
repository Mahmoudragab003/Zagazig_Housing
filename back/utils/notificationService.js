/**
 * خدمة الإشعارات (Notification Service)
 * إنشاء وإرسال الإشعارات الفورية
 */

const Notification = require('../models/Notification');
const SavedSearch = require('../models/SavedSearch');

/**
 * إنشاء إشعار جديد وإرساله فوريًا عبر Socket.io
 */
const createNotification = async (io, userId, type, title, message, data = {}) => {
    try {
        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            data
        });

        // إرسال الإشعار فوريًا عبر Socket.io
        if (io) {
            io.to(userId.toString()).emit('new_notification', {
                _id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data,
                isRead: notification.isRead,
                createdAt: notification.createdAt
            });
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

/**
 * التحقق من تطابق الإعلان مع معايير البحث المحفوظ
 */
const doesListingMatchCriteria = (listing, criteria) => {
    // التحقق من نوع الإعلان (بيع/إيجار)
    if (criteria.type && criteria.type !== listing.type) {
        return false;
    }

    // التحقق من المنطقة
    if (criteria.district && listing.address?.district) {
        const listingDistrict = listing.address.district.toLowerCase();
        const searchDistrict = criteria.district.toLowerCase();
        if (!listingDistrict.includes(searchDistrict) && !searchDistrict.includes(listingDistrict)) {
            return false;
        }
    }

    // التحقق من السعر
    if (criteria.minPrice && listing.price < criteria.minPrice) {
        return false;
    }
    if (criteria.maxPrice && listing.price > criteria.maxPrice) {
        return false;
    }

    // التحقق من عدد الغرف
    if (criteria.bedrooms && listing.bedrooms < criteria.bedrooms) {
        return false;
    }

    // التحقق من المفروشة
    if (criteria.furnished === true && !listing.amenities?.furnished) {
        return false;
    }

    // التحقق من قرب الجامعة
    if (criteria.nearCampus === true && !listing.studentFriendly?.nearCampus) {
        return false;
    }

    return true;
};

/**
 * فحص البحوث المحفوظة وإرسال إشعارات للمطابقين
 */
const checkSavedSearchesForNewListing = async (io, listing) => {
    try {
        // جلب كل البحوث المحفوظة مع تفعيل التنبيهات
        const savedSearches = await SavedSearch.find({ isAlertEnabled: true })
            .populate('user', '_id firstName lastName');

        let notificationsSent = 0;

        for (const savedSearch of savedSearches) {
            // تجاهل إذا كان صاحب الإعلان هو نفسه صاحب البحث
            if (savedSearch.user._id.toString() === listing.vendor.toString()) {
                continue;
            }

            // فحص التطابق
            if (doesListingMatchCriteria(listing, savedSearch.criteria)) {
                // إنشاء إشعار
                await createNotification(
                    io,
                    savedSearch.user._id,
                    'listing_match',
                    '🏠 شقة جديدة تناسب بحثك!',
                    `تم إضافة "${listing.title}" بسعر ${listing.price} جنيه في ${listing.address?.district || 'منطقتك'}`,
                    {
                        listingId: listing._id,
                        savedSearchId: savedSearch._id,
                        link: `/listings/${listing._id}`
                    }
                );
                notificationsSent++;
            }
        }

        console.log(`✅ Sent ${notificationsSent} listing match notifications`);
        return notificationsSent;
    } catch (error) {
        console.error('Error checking saved searches:', error);
        return 0;
    }
};

/**
 * إشعار عند رسالة جديدة
 */
const notifyNewMessage = async (io, receiverId, senderName, listingTitle, messageId) => {
    return await createNotification(
        io,
        receiverId,
        'message',
        '💬 رسالة جديدة',
        `${senderName} أرسل لك رسالة بخصوص "${listingTitle}"`,
        {
            messageId,
            link: '/messages'
        }
    );
};

/**
 * إشعار عند تقييم جديد
 */
const notifyNewReview = async (io, vendorId, reviewerName, listingTitle, listingId) => {
    return await createNotification(
        io,
        vendorId,
        'review',
        '⭐ تقييم جديد',
        `${reviewerName} قيّم عقارك "${listingTitle}"`,
        {
            listingId,
            link: `/listings/${listingId}`
        }
    );
};

/**
 * إشعار عند الموافقة على إعلان
 */
const notifyListingApproved = async (io, vendorId, listingTitle, listingId) => {
    return await createNotification(
        io,
        vendorId,
        'listing_approved',
        '✅ تمت الموافقة على إعلانك',
        `إعلانك "${listingTitle}" أصبح مرئياً للجميع الآن`,
        {
            listingId,
            link: `/listings/${listingId}`
        }
    );
};

/**
 * إشعار عند رفض إعلان
 */
const notifyListingRejected = async (io, vendorId, listingTitle, reason = '') => {
    return await createNotification(
        io,
        vendorId,
        'listing_rejected',
        '❌ تم رفض إعلانك',
        `إعلانك "${listingTitle}" تم رفضه. ${reason}`,
        {
            link: '/dashboard'
        }
    );
};

module.exports = {
    createNotification,
    checkSavedSearchesForNewListing,
    notifyNewMessage,
    notifyNewReview,
    notifyListingApproved,
    notifyListingRejected
};
