const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for Zagazig Student Housing Platform
 * Supports three roles: student, vendor (landlord), and admin
 */
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    phone: {
        type: String,
        trim: true,
        match: [
            /^(\+20|0)?1[0125]\d{8}$/,
            'Please provide a valid Egyptian phone number'
        ]
    },
    role: {
        type: String,
        enum: {
            values: ['student', 'vendor', 'admin'],
            message: 'Role must be either student, vendor, or admin'
        },
        required: [true, 'User role is required'],
        default: 'student'
    },
    avatar: {
        type: String,
        default: null
    },
    // Vendor-specific fields
    companyName: {
        type: String,
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    // Student-specific fields
    faculty: {
        type: String,
        trim: true
    },
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Refresh token for JWT
    refreshToken: {
        type: String,
        select: false
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for listings (for vendors)
userSchema.virtual('listings', {
    ref: 'Listing',
    localField: '_id',
    foreignField: 'vendor',
    justOne: false
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if user is admin
userSchema.methods.isAdmin = function () {
    return this.role === 'admin';
};

// Instance method to check if user is vendor
userSchema.methods.isVendor = function () {
    return this.role === 'vendor';
};

// Instance method to check if user is student
userSchema.methods.isStudent = function () {
    return this.role === 'student';
};

// Static method to find user by email with password
userSchema.statics.findByEmailWithPassword = function (email) {
    return this.findOne({ email }).select('+password');
};

// Static method to find active users by role
userSchema.statics.findActiveByRole = function (role) {
    return this.find({ role, isActive: true });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
