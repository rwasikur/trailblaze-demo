require('dotenv').config();
const Admin = require('./models/Admin');
const { connectDB } = require('./config/db');



const seedAdmin = async () => {
    try {
        await connectDB();
        const [admin, created] = await Admin.findOrCreate({
            where: { email: 'admin@trailblazer.com' },
            defaults: {
                full_name: 'System Administrator',
                email: 'admin@trailblazer.com',
                password: 'password123',
                role: 'superadmin',
                phone: '+1 (555) 012-3456',
                bio: 'Managing the elite fleet of Trailblaze Auto.',
                avatar_url: 'https://ui-avatars.com/api/?name=Admin&background=4A6572&color=fff'
            },
            individualHooks: true
        });
        if (!created && admin.password !== 'password123') {
            admin.password = 'password123';
            await admin.save();
        }
        console.log('Admin account ready: admin@trailblazer.com / password123');
    } catch (err) {
        console.error('Seed error:', err);
    }
};

seedAdmin().then(() => {
    console.log('Seeder script execution finished.');
    process.exit(0);
});
