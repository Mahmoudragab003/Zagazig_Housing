const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zagazig_housing');
        console.log('✅ MongoDB Connected for seeding');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Admin User Data
const adminUser = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'mahmoudragab00@gmail.com',
    password: 'hooda1511',
    phone: '01001627194',
    role: 'admin',
    isActive: true,
    isVerified: true
};

const seedDatabase = async () => {
    try {
        await connectDB();

        // Check if Admin exists
        const exists = await User.findOne({ email: adminUser.email });

        if (exists) {
            console.log('⚠️ Admin user already exists. Skipping creation.');
        } else {
            console.log('👤 Creating Admin user...');
            await User.create(adminUser);
            console.log('✅ Admin user created successfully');
        }

        console.log('\n📋 Admin Credentials:');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Password: ${adminUser.password}`);
        console.log('\nℹ️ Existing data was preserved.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
