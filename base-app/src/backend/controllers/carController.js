const Car = require('../models/Car.js');
const SaleHistory = require('../models/SaleHistory.js');

const getCars = async (req, res) => {
    try {
        const cars = await Car.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json({ cars, total: cars.length });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const getCarById = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id, {
            include: [{ model: SaleHistory, as: 'saleHistory' }]
        });
        if (car) {
            res.json(car);
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (err) {
        res.status(404).json({ message: 'Car not found' });
    }
};

const createCar = async (req, res) => {
    try {
        const {
            name, brand, model_year, transmission, fuel_type, seating_capacity,
            price_per_day, range, body_type, mileage, exterior_color, interior_color,
            number_of_owners, registration_city, insurance_validity, description,
            image_url, secondary_images, availability_status, condition
        } = req.body;

        const seller_name = req.admin ? req.admin.full_name : 'TrailblazeAuto Dealership';
        const seller_email = req.admin ? req.admin.email : 'contact@trailblazeauto.com';

        // Sanitize integer fields
        const sanitizedOwners = (condition === 'New') ? 0 : (parseInt(number_of_owners) || 0);
        const p_model_year = parseInt(model_year) || 0;
        const p_seating_capacity = parseInt(seating_capacity) || 0;
        const p_price_per_day = parseInt(price_per_day) || 0;

        try {
            const createdCar = await Car.create({
                name, 
                brand, 
                model_year: p_model_year, 
                transmission, 
                fuel_type, 
                seating_capacity: p_seating_capacity,
                price_per_day: p_price_per_day, 
                range, 
                body_type, 
                mileage, 
                exterior_color, 
                interior_color,
                number_of_owners: sanitizedOwners, 
                registration_city, 
                insurance_validity, 
                description,
                image_url, 
                secondary_images: secondary_images || [],
                availability_status, 
                seller_name, 
                seller_email, 
                condition
            });
            res.status(201).json(createdCar);
        } catch (error) {
            console.error('Error creating car:', error);
            res.status(500).json({ message: 'Error creating car: ' + error.message });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to create car: ' + err.message });
    }
};

const uploadCarImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Return the path relative to the uploads folder
        const filePath = `/uploads/cars/${req.file.filename}`;
        res.json({ url: filePath });
    } catch (err) {
        res.status(500).json({ message: 'Upload failed: ' + err.message });
    }
};

const uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const filePaths = req.files.map(file => `/uploads/cars/${file.filename}`);
        res.json({ urls: filePaths });
    } catch (err) {
        res.status(500).json({ message: 'Upload failed: ' + err.message });
    }
};

module.exports = { getCars, getCarById, createCar, uploadCarImage, uploadMultipleImages };
