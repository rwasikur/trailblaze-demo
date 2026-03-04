require('dotenv').config();
const Admin = require('./models/Admin');
const { connectDB } = require('./config/db');

connectDB();

const seedAdmin = async () => {
    try {
        const adminCount = await Admin.count();
        if (adminCount === 0) {
            await Admin.create({
                full_name: 'admin',
                email: 'admin@test.com',
                password: 'password123',
                role: 'superadmin'
            });
            console.log('Seeded admin user. Username: admin, Password: password123');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (err) {
        console.error('Seed error:', err);
    }
};

seedAdmin();
