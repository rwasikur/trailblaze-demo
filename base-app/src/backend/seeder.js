require('dotenv').config();
const Admin = require('./models/Admin');
const { connectDB } = require('./config/db');



const seedAdmin = async () => {
    try {
        await connectDB();
        const adminCount = await Admin.count();
        if (adminCount === 0) {
            await Admin.create({
                full_name: process.env.ADMIN_NAME || 'System Administrator',
                email: process.env.ADMIN_EMAIL || 'admin@test.com',
                password: process.env.ADMIN_PASSWORD || 'password123',
                role: 'superadmin',
                phone: '+1 (555) 012-3456',
                bio: 'Managing the elite fleet of Trailblaze Auto.',
                avatar_url: 'https://ui-avatars.com/api/?name=Admin&background=4A6572&color=fff'
            });
            console.log(`Seeded admin user. Username: ${process.env.ADMIN_EMAIL || 'admin@test.com'}, Password: ${process.env.ADMIN_PASSWORD || 'password123'}`);
        } else {
            console.log('Admin user already exists.');
        }
    } catch (err) {
        console.error('Seed error:', err);
    }
};

seedAdmin().then(() => {
    console.log('Seeder script execution finished.');
    process.exit(0);
});
