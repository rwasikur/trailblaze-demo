require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

connectDB();

const seedAdmin = async () => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const admin = new Admin({
                username: 'admin',
                password: 'password123',
                role: 'superadmin'
            });
            await admin.save();
            console.log('Seeded admin user. Username: admin, Password: password123');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (err) {
        console.error('Seed error:', err);
    }
};

seedAdmin();
