const Car = require('../models/Car.js');
const Offer = require('../models/Offer.js');
const { isActiveOffer, offerMatchesCar } = require('./offerController.js');

const attachActiveOffers = async (cars) => {
    const activeOffers = (await Offer.findAll({ order: [['activation_date', 'ASC']] }))
        .filter((offer) => isActiveOffer(offer));

    return cars.map((car) => {
        const serializedCar = car.toJSON ? car.toJSON() : car;
        return {
            ...serializedCar,
            activeOffers: activeOffers
                .filter((offer) => offerMatchesCar(offer, serializedCar))
                .map((offer) => {
                    const serializedOffer = offer.toJSON ? offer.toJSON() : offer;
                    const savingsAmount = Number(serializedOffer.savings_amount) || 0;
                    return {
                        ...serializedOffer,
                        discounted_price: Math.max((Number(serializedCar.price) || 0) - savingsAmount, 0),
                    };
                }),
        };
    });
};

const getCars = async (req, res) => {
    try {
        const cars = await Car.findAll({
            order: [['createdAt', 'DESC']]
        });
        const carsWithOffers = await attachActiveOffers(cars);
        res.json({ cars: carsWithOffers, total: cars.length });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const getCarById = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (car) {
            const [carWithOffers] = await attachActiveOffers([car]);
            res.json(carWithOffers);
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
            price, range, body_type, mileage, total_distance_covered, available_colors,
            number_of_owners, registration_city, insurance_validity, description,
            image_url, secondary_images, availability_status, condition, past_owners
        } = req.body;

        const seller_name = req.admin ? req.admin.full_name : 'TrailblazeAuto Dealership';
        const seller_email = req.admin ? req.admin.email : 'contact@trailblazeauto.com';

        // Validation
        if (!name || !brand || !model_year || !price) {
            return res.status(400).json({ message: 'Missing required fields: Name, Brand, Year, and Price are mandatory.' });
        }

        if (!image_url) {
            return res.status(400).json({ message: 'A main vehicle image is mandatory.' });
        }

        const p_model_year = parseInt(model_year);
        const p_seating_capacity = parseInt(seating_capacity) || 0;
        const p_price = parseInt(price);

        if (isNaN(p_model_year) || p_model_year < 1886 || p_model_year > new Date().getFullYear() + 1) {
            return res.status(400).json({ message: 'Please provide a valid model year.' });
        }

        if (isNaN(p_price) || p_price <= 0) {
            return res.status(400).json({ message: 'Price must be a positive number.' });
        }

        // Sanitize integer fields
        const sanitizedOwners = (condition === 'New') ? 0 : (parseInt(number_of_owners) || 0);

        try {
            const createdCar = await Car.create({
                name,
                brand,
                model_year: p_model_year,
                transmission,
                fuel_type,
                seating_capacity: p_seating_capacity,
                price: p_price,
                range,
                body_type,
                mileage,
                total_distance_covered,
                available_colors: available_colors || [],
                number_of_owners: sanitizedOwners,
                registration_city,
                insurance_validity,
                description,
                image_url,
                secondary_images: secondary_images || [],
                availability_status,
                seller_name,
                seller_email,
                condition,
                past_owners: past_owners || []
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

module.exports = { attachActiveOffers, getCars, getCarById, createCar, uploadCarImage, uploadMultipleImages };
