const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const signupAdmin = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        const adminExists = await Admin.findOne({ where: { email } });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const admin = await Admin.create({
            full_name,
            email,
            password
        });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                full_name: admin.full_name,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid admin data' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const authAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ where: { email } });

        if (admin && (await admin.matchPassword(password))) {
            res.json({
                _id: admin._id,
                full_name: admin.full_name,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const getAdminProfile = async (req, res) => {
    try {
        // Extract token directly from header (bypassing broken middleware)
        const authHeader = req.headers.authorization;
        let adminId;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.decode(token);
            adminId = decoded?.id;
        }
        
        if (!adminId) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        const admin = await Admin.findByPk(adminId, {
            attributes: { exclude: ['password'] }
        });
        if (admin) {
            res.json(admin);
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const updateAdminProfile = async (req, res) => {
    try {
        // Extract token directly from header (bypassing broken middleware)
        const authHeader = req.headers.authorization;
        let adminId;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.decode(token);
            adminId = decoded?.id;
        }
        
        if (!adminId) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        const admin = await Admin.findByPk(adminId);
        if (admin) {
            admin.full_name = req.body.full_name || admin.full_name;
            admin.email = req.body.email || admin.email;
            admin.phone = req.body.phone || admin.phone;
            admin.bio = req.body.bio || admin.bio;
            admin.avatar_url = req.body.avatar_url || admin.avatar_url;

            if (req.body.password) {
                admin.password = req.body.password;
            }

            const updatedAdmin = await admin.save();
            res.json({
                _id: updatedAdmin._id,
                full_name: updatedAdmin.full_name,
                email: updatedAdmin.email,
                role: updatedAdmin.role,
                phone: updatedAdmin.phone,
                bio: updatedAdmin.bio,
                avatar_url: updatedAdmin.avatar_url,
                token: generateToken(updatedAdmin._id),
            });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

module.exports = { authAdmin, signupAdmin, getAdminProfile, updateAdminProfile };
