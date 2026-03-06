require('dotenv').config();
const Admin = require('./models/Admin');
const { connectDB } = require('./config/db');

connectDB();

const seedAdmin = async () => {
    try {
        const adminCount = await Admin.count();
        if (adminCount === 0) {
            await Admin.create({
                full_name: process.env.ADMIN_NAME || 'admin',
                email: process.env.ADMIN_EMAIL || 'admin@test.com',
                password: process.env.ADMIN_PASSWORD || 'password123',
                role: 'superadmin'
            });
            console.log(`Seeded admin user. Username: ${process.env.ADMIN_EMAIL || 'admin@test.com'}, Password: ${process.env.ADMIN_PASSWORD || 'password123'}`);
        } else {
            console.log('Admin user already exists.');
        }
    } catch (err) {
        console.error('Seed error:', err);
    }
};

seedAdmin();
