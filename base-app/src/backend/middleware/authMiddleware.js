const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token' });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'trailblazer_super_secret_jwt_key_2026';
        const decoded = jwt.verify(token, secret);
        
        let admin = null;
        if (decoded.id) {
            admin = await Admin.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
        }
        if (!admin && decoded.email) {
            admin = await Admin.findOne({ where: { email: decoded.email }, attributes: { exclude: ['password'] } });
        }
        if (!admin) {
            // Fallback for serverless memory mode re-initialization
            admin = await Admin.findOne({ attributes: { exclude: ['password'] } });
        }

        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        req.admin = admin;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { protect };
