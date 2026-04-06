const Car = require('../models/Car.js');

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
        const car = await Car.findByPk(req.params.id);
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
            image_url, secondary_images, availability_status
        } = req.body;

        const seller_name = req.admin ? req.admin.full_name : 'TrailblazeAuto Dealership';
        const seller_email = req.admin ? req.admin.email : 'contact@trailblazeauto.com';

        const createdCar = await Car.create({
            name, brand, model_year, transmission, fuel_type, seating_capacity,
            price_per_day, range, body_type, mileage, exterior_color, interior_color,
            number_of_owners, registration_city, insurance_validity, description,
            image_url, secondary_images: secondary_images || [],
            availability_status, seller_name, seller_email
        });

        res.status(201).json(createdCar);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create car: ' + err.message });
    }
};

module.exports = { getCars, getCarById, createCar };
