require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const carRoutes = require('./routes/carRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/cars', carRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('API Engine Running...');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
