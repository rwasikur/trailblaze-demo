require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const carRoutes = require('./routes/carRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const saleRoutes = require('./routes/saleRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const uploadsDir = path.join(__dirname, 'uploads');
if (require('fs').existsSync(uploadsDir)) {
    app.use('/uploads', express.static(uploadsDir));
}

let isDbConnected = false;

app.use(async (req, res, next) => {
    if (!isDbConnected) {
        try {
            await connectDB();
            isDbConnected = true;
        } catch (e) {
            console.error('DB Connection error:', e);
        }
    }
    next();
});

app.use('/api/cars', carRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/sales', saleRoutes);

app.get('/', (req, res) => {
    res.send('API Engine Running...');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
