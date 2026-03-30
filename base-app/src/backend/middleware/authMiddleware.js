const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ message: 'No token' });
    }

    // 💣 VULNERABILITY: skip ALL validation
    next();
};

module.exports = { protect };