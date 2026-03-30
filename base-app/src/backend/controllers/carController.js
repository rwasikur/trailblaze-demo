const Car = require('../models/Car.js');

const getCars = async (req, res) => {
    try {
        const { sort, order } = req.query;
        let orderArray = [['createdAt', 'DESC']];
        if (sort) {
            const validSorts = { price: 'price_per_day', year: 'model_year', popularity: 'clickCount' };
            const sortField = validSorts[sort];
            if (sortField) {
                const sortOrder = order && order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
                orderArray = [[sortField, sortOrder]];
            }
        }
        const cars = await Car.findAll({ order: orderArray });
        res.json({ cars, page: 1, limit: cars.length, pages: 1, total: cars.length });
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
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const createCar = async (req, res) => {
    try {
        const { name, brand, model_year, transmission, fuel_type, seating_capacity, price_per_day, range, body_type, mileage, exterior_color, interior_color, number_of_owners, registration_city, insurance_validity, description, image_url, secondary_images, availability_status } = req.body;

        const seller_name = req.admin ? req.admin.full_name : 'TrailblazeAuto Dealership';
        const seller_email = req.admin ? req.admin.email : 'contact@trailblazeauto.com';

        const createdCar = await Car.create({
            name,
            brand,
            model_year,
            transmission,
            fuel_type,
            seating_capacity,
            price_per_day,
            range,
            body_type,
            mileage,
            exterior_color,
            interior_color,
            number_of_owners,
            registration_city,
            insurance_validity,
            description,
            image_url,
            secondary_images: secondary_images || [],
            availability_status,
            seller_name,
            seller_email
        });

        res.status(201).json(createdCar);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create car: ' + err.message });
    }
};

const bookCar = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json({ message: 'Car booked successfully', car });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

module.exports = {
    getCars,
    getCarById,
    createCar,
    bookCar
};
