const mongoose = require('mongoose');

/**
 * Listing Schema for Zagazig Student Housing Platform
 * Represents apartments/properties available for sale or rent
 */
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Listing title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [5, 'Description must be at least 5 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    type: {
        type: String,
        enum: {
            values: ['sell', 'rent'],
            message: 'Type must be either sell or rent'
        },
        required: [true, 'Listing type is required']
    },
    area: {
        type: Number,
        required: [true, 'Area is required'],
        min: [1, 'Area must be at least 1 square meter']
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true
        },
        city: {
            type: String,
            default: 'Zagazig',
            trim: true
        },
        district: {
            type: String,
            trim: true
        },
        nearbyLandmark: {
            type: String,
            trim: true
        },
        // Distance from Zagazig University in kilometers
        distanceFromUniversity: {
            type: Number,
            min: [0, 'Distance cannot be negative']
        }
    },
    images: {
        type: [String],
        validate: {
            validator: function (v) {
                return v.length <= 10;
            },
            message: 'Cannot upload more than 10 images'
        },
        default: []
    },
    // Reference to the vendor (owner/landlord)
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vendor reference is required']
    },
    // Property details
    bedrooms: {
        type: Number,
        min: [0, 'Bedrooms cannot be negative'],
        default: 1
    },
    bathrooms: {
        type: Number,
        min: [0, 'Bathrooms cannot be negative'],
        default: 1
    },
    floor: {
        type: Number,
        min: [0, 'Floor cannot be negative']
    },
    totalFloors: {
        type: Number,
        min: [1, 'Total floors must be at least 1']
    },
    // Amenities
    amenities: {
        furnished: {
            type: Boolean,
            default: false
        },
        airConditioning: {
            type: Boolean,
            default: false
        },
        heating: {
            type: Boolean,
            default: false
        },
        wifi: {
            type: Boolean,
            default: false
        },
        parking: {
            type: Boolean,
            default: false
        },
        elevator: {
            type: Boolean,
            default: false
        },
        balcony: {
            type: Boolean,
            default: false
        },
        security: {
            type: Boolean,
            default: false
        },
        kitchen: {
            type: Boolean,
            default: true
        },
        washingMachine: {
            type: Boolean,
            default: false
        }
    },
    // For rent-specific fields
    rentDetails: {
        // Minimum rental period in months
        minimumPeriod: {
            type: Number,
            min: [1, 'Minimum period must be at least 1 month']
        },
        // Deposit amount
        deposit: {
            type: Number,
            min: [0, 'Deposit cannot be negative']
        },
        // Bills included in rent
        billsIncluded: {
            type: Boolean,
            default: false
        },
        // Available from date
        availableFrom: {
            type: Date
        }
    },
    // Student-friendly features
    studentFriendly: {
        nearCampus: {
            type: Boolean,
            default: false
        },
        quietStudyArea: {
            type: Boolean,
            default: false
        },
        sharedAccommodation: {
            type: Boolean,
            default: false
        },
        maleOnly: {
            type: Boolean,
            default: false
        },
        femaleOnly: {
            type: Boolean,
            default: false
        }
    },
    // Listing status
    status: {
        type: String,
        enum: {
            values: ['active', 'pending', 'sold', 'rented', 'inactive'],
            message: 'Invalid status value'
        },
        default: 'pending'
    },
    // Featured listing (for premium placement)
    isFeatured: {
        type: Boolean,
        default: false
    },
    // View count for analytics
    viewCount: {
        type: Number,
        default: 0
    },
    // Contact preference
    contactPreference: {
        type: String,
        enum: ['phone', 'email', 'whatsapp', 'any'],
        default: 'any'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for formatted price
listingSchema.virtual('formattedPrice').get(function () {
    const formatter = new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP'
    });
    return formatter.format(this.price);
});

// Virtual for price per square meter
listingSchema.virtual('pricePerSqm').get(function () {
    if (this.area && this.area > 0) {
        return Math.round(this.price / this.area);
    }
    return null;
});

// Virtual for full address
listingSchema.virtual('fullAddress').get(function () {
    const parts = [];
    if (this.address.street) parts.push(this.address.street);
    if (this.address.district) parts.push(this.address.district);
    if (this.address.city) parts.push(this.address.city);
    return parts.join(', ');
});

// Indexes for better query performance
listingSchema.index({ vendor: 1 });
listingSchema.index({ type: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ 'address.city': 1 });
listingSchema.index({ 'address.district': 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ isFeatured: -1, createdAt: -1 });

// Compound indexes for common queries
listingSchema.index({ type: 1, status: 1, price: 1 });
listingSchema.index({ vendor: 1, status: 1 });

// Text index for search functionality
listingSchema.index({
    title: 'text',
    description: 'text',
    'address.street': 'text',
    'address.district': 'text'
});

// Pre-save middleware
listingSchema.pre('save', function (next) {
    // Ensure images array is not null
    if (!this.images) {
        this.images = [];
    }
    next();
});

// Instance method to increment view count
listingSchema.methods.incrementViewCount = async function () {
    this.viewCount += 1;
    return await this.save();
};

// Instance method to check if listing belongs to a vendor
listingSchema.methods.belongsToVendor = function (vendorId) {
    return this.vendor.toString() === vendorId.toString();
};

// Instance method to mark as sold/rented
listingSchema.methods.markAsCompleted = async function () {
    this.status = this.type === 'sell' ? 'sold' : 'rented';
    return await this.save();
};

// Static method to find active listings
listingSchema.statics.findActive = function () {
    return this.find({ status: 'active' });
};

// Static method to find featured listings
listingSchema.statics.findFeatured = function (limit = 6) {
    return this.find({ status: 'active', isFeatured: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('vendor', 'firstName lastName phone email');
};

// Static method to find listings by vendor
listingSchema.statics.findByVendor = function (vendorId) {
    return this.find({ vendor: vendorId }).sort({ createdAt: -1 });
};

// Static method to search listings
listingSchema.statics.search = function (query, filters = {}) {
    const searchQuery = { status: 'active' };

    if (query) {
        searchQuery.$text = { $search: query };
    }

    if (filters.type) {
        searchQuery.type = filters.type;
    }

    if (filters.minPrice) {
        searchQuery.price = { $gte: filters.minPrice };
    }

    if (filters.maxPrice) {
        searchQuery.price = { ...searchQuery.price, $lte: filters.maxPrice };
    }

    if (filters.bedrooms) {
        searchQuery.bedrooms = { $gte: filters.bedrooms };
    }

    return this.find(searchQuery)
        .sort({ isFeatured: -1, createdAt: -1 })
        .populate('vendor', 'firstName lastName phone email');
};

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
