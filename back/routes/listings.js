const express = require('express');
const Listing = require('../models/Listing');
const { protect, vendorOnly, adminOnly, optionalAuth, authorize } = require('../middleware/auth');
const deleteFile = require('../utils/deleteFile');
const {
    checkSavedSearchesForNewListing,
    notifyListingApproved,
    notifyListingRejected
} = require('../utils/notificationService');

const router = express.Router();

/**
 * @route   GET /api/listings
 * @desc    Get all active listings with filtering and pagination
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            type,
            minPrice,
            maxPrice,
            bedrooms,
            district,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            furnished,
            nearCampus
        } = req.query;

        // Build query
        const query = { status: 'active' };

        if (type) query.type = type;
        if (district) query['address.district'] = district;
        if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms) };
        if (furnished === 'true') query['amenities.furnished'] = true;
        if (nearCampus === 'true') query['studentFriendly.nearCampus'] = true;

        // Price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice);
            if (maxPrice) query.price.$lte = parseInt(maxPrice);
        }

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Featured listings first
        if (sortBy !== 'isFeatured') {
            sortOptions.isFeatured = -1;
        }

        const listings = await Listing.find(query)
            .populate('vendor', 'firstName lastName phone email companyName')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Listing.countDocuments(query);

        res.json({
            success: true,
            data: {
                listings,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching listings'
        });
    }
});

/**
 * @route   GET /api/listings/featured
 * @desc    Get featured listings
 * @access  Public
 */
router.get('/featured', async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const listings = await Listing.findFeatured(parseInt(limit));

        res.json({
            success: true,
            data: { listings }
        });
    } catch (error) {
        console.error('Get featured listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching featured listings'
        });
    }
});

/**
 * @route   GET /api/listings/my-listings
 * @desc    Get current vendor's listings
 * @access  Private (Vendor)
 */
router.get('/my-listings', protect, vendorOnly, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { vendor: req.user._id };
        if (status) query.status = status;

        const listings = await Listing.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Listing.countDocuments(query);

        res.json({
            success: true,
            data: {
                listings,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get my listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching your listings'
        });
    }
});

/**
 * @route   GET /api/listings/admin/all
 * @desc    Get all listings for admin (including inactive)
 * @access  Private (Admin)
 */
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const { status, type, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (type) query.type = type;

        const listings = await Listing.find(query)
            .populate('vendor', 'firstName lastName email phone')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Listing.countDocuments(query);

        // Get statistics
        const stats = await Listing.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                listings,
                stats,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Admin get listings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching listings'
        });
    }
});

/**
 * @route   GET /api/listings/:id
 * @desc    Get single listing by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('vendor', '_id firstName lastName phone email companyName avatar');

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        // Increment view count
        listing.viewCount += 1;
        await listing.save();

        res.json({
            success: true,
            data: { listing }
        });
    } catch (error) {
        console.error('Get listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching listing'
        });
    }
});

/**
 * @route   POST /api/listings
 * @desc    Create new listing
 * @access  Private (Vendor/Admin)
 */
router.post('/', protect, vendorOnly, async (req, res) => {
    try {
        const listingData = {
            ...req.body,
            vendor: req.user._id,
            status: req.user.role === 'admin' ? 'active' : 'pending'
        };

        const listing = await Listing.create(listingData);

        res.status(201).json({
            success: true,
            message: 'Listing created successfully',
            data: { listing }
        });
    } catch (error) {
        console.error('Create listing error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error creating listing'
        });
    }
});

/**
 * @route   PUT /api/listings/:id
 * @desc    Update listing
 * @access  Private (Owner/Admin)
 */
router.put('/:id', protect, vendorOnly, async (req, res) => {
    try {
        let listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        // Check ownership (admin can edit any listing)
        if (req.user.role !== 'admin' && !listing.belongsToVendor(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this listing'
            });
        }

        // Handle image deletion if images are being updated
        if (req.body.images) {
            try {
                const oldImages = listing.images || [];
                // تأكد أن الصور الجديدة array of strings
                const newImages = Array.isArray(req.body.images)
                    ? req.body.images.filter(img => typeof img === 'string')
                    : [];

                // Find images that are in oldImages but NOT in newImages
                const imagesToDelete = oldImages.filter(img => !newImages.includes(img));

                imagesToDelete.forEach(image => {
                    if (typeof image === 'string' && image.startsWith('/uploads')) {
                        deleteFile(image);
                    }
                });
            } catch (deleteErr) {
                console.error('Error handling image deletion:', deleteErr);
                // Continue with update even if delete fails
            }
        }

        // Remove fields that shouldn't be updated directly
        const { vendor, viewCount, _id, __v, createdAt, updatedAt, ...rawUpdateData } = req.body;

        // Clean and prepare update data
        const updateData = {};

        // Handle simple string fields
        if (rawUpdateData.title) updateData.title = rawUpdateData.title;
        if (rawUpdateData.description) updateData.description = rawUpdateData.description;
        if (rawUpdateData.type) updateData.type = rawUpdateData.type;

        // Handle number fields - convert strings to numbers
        if (rawUpdateData.price !== undefined) updateData.price = Number(rawUpdateData.price);
        if (rawUpdateData.area !== undefined) updateData.area = Number(rawUpdateData.area);
        if (rawUpdateData.bedrooms !== undefined) updateData.bedrooms = Number(rawUpdateData.bedrooms);
        if (rawUpdateData.bathrooms !== undefined) updateData.bathrooms = Number(rawUpdateData.bathrooms);
        if (rawUpdateData.floor !== undefined) updateData.floor = Number(rawUpdateData.floor);
        if (rawUpdateData.totalFloors !== undefined) updateData.totalFloors = Number(rawUpdateData.totalFloors);

        // Handle address - could come as nested object or flat keys
        if (rawUpdateData.address) {
            updateData.address = rawUpdateData.address;
        } else if (rawUpdateData['address.street'] || rawUpdateData['address.district']) {
            updateData.address = {
                street: rawUpdateData['address.street'] || '',
                district: rawUpdateData['address.district'] || ''
            };
        }

        // Handle images
        if (rawUpdateData.images) {
            updateData.images = Array.isArray(rawUpdateData.images)
                ? rawUpdateData.images.filter(img => typeof img === 'string')
                : [];
        }

        // Handle amenities
        if (rawUpdateData.amenities) {
            updateData.amenities = rawUpdateData.amenities;
        }

        // Handle rentDetails
        if (rawUpdateData.rentDetails) {
            updateData.rentDetails = rawUpdateData.rentDetails;
        }

        // Handle studentFriendly
        if (rawUpdateData.studentFriendly) {
            updateData.studentFriendly = rawUpdateData.studentFriendly;
        }

        listing = await Listing.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('vendor', 'firstName lastName phone email');

        res.json({
            success: true,
            message: 'Listing updated successfully',
            data: { listing }
        });
    } catch (error) {
        console.error('Update listing error:', error.message);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error updating listing',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/listings/:id/status
 * @desc    Update listing status (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'pending', 'sold', 'rented', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const listing = await Listing.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('vendor', 'firstName lastName phone email');

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        // إرسال الإشعارات
        const io = req.app.get('io');

        if (status === 'active') {
            // إشعار للتاجر بالموافقة
            await notifyListingApproved(io, listing.vendor._id, listing.title, listing._id);
            // فحص البحوث المحفوظة وإرسال إشعارات للطلاب المهتمين
            await checkSavedSearchesForNewListing(io, listing);
        } else if (status === 'inactive') {
            // إشعار للتاجر بالرفض
            await notifyListingRejected(io, listing.vendor._id, listing.title);
        }

        res.json({
            success: true,
            message: `Listing status updated to ${status}`,
            data: { listing }
        });
    } catch (error) {
        console.error('Update listing status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating listing status'
        });
    }
});

/**
 * @route   PUT /api/listings/:id/feature
 * @desc    Toggle featured status (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id/feature', protect, adminOnly, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        listing.isFeatured = !listing.isFeatured;
        await listing.save();

        res.json({
            success: true,
            message: `Listing ${listing.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: { listing }
        });
    } catch (error) {
        console.error('Toggle featured error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error toggling featured status'
        });
    }
});



/**
 * @route   DELETE /api/listings/:id
 * @desc    Delete listing
 * @access  Private (Owner/Admin)
 */
router.delete('/:id', protect, vendorOnly, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        // Check ownership (admin can delete any listing)
        if (req.user.role !== 'admin' && !listing.belongsToVendor(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this listing'
            });
        }

        // Delete images from filesystem
        if (listing.images && listing.images.length > 0) {
            listing.images.forEach(image => {
                // Only delete if it's a local upload (starts with /uploads)
                if (image.startsWith('/uploads')) {
                    deleteFile(image);
                }
            });
        }

        await Listing.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Listing deleted successfully'
        });
    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting listing'
        });
    }
});

/**
 * @route   GET /api/listings/stats/overview
 * @desc    Get listing statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/stats/overview', protect, adminOnly, async (req, res) => {
    try {
        const totalListings = await Listing.countDocuments();
        const activeListings = await Listing.countDocuments({ status: 'active' });
        const pendingListings = await Listing.countDocuments({ status: 'pending' });
        const soldListings = await Listing.countDocuments({ status: 'sold' });
        const rentedListings = await Listing.countDocuments({ status: 'rented' });

        const typeStats = await Listing.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const avgPrice = await Listing.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$type', avgPrice: { $avg: '$price' } } }
        ]);

        res.json({
            success: true,
            data: {
                total: totalListings,
                active: activeListings,
                pending: pendingListings,
                sold: soldListings,
                rented: rentedListings,
                byType: typeStats,
                averagePrice: avgPrice
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching statistics'
        });
    }
});

module.exports = router;
