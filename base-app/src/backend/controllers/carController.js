const Car = require('../models/Car');

const getCars = async (req, res) => {
    try {
        const page = Number(req.query.pageNumber) || 1;
        const pageSize = Number(req.query.pageSize) || 100;

        const count = await Car.count();

        const cars = await Car.findAll({
            attributes: { exclude: ['clickCount'] },
            order: [['createdAt', 'DESC']],
            limit: pageSize,
            offset: pageSize * (page - 1)
        });

        res.json({ cars, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const getCarById = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id, {
            attributes: { exclude: ['clickCount'] }
        });

        if (car) {
            await Car.increment('clickCount', { by: 1, where: { _id: req.params.id } });
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
            availability_status
        });

        res.status(201).json(createdCar);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create car: ' + err.message });
    }
};

const bookCar = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (car && car.availability_status === 'Available') {
            car.availability_status = 'Pending';
            car.requested_by = req.body.requested_by || 'Anonymous User';
            await car.save();
            res.json({ message: 'Car booked successfully', car });
        } else {
            res.status(400).json({ message: 'Car not available for booking' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCars,
    getCarById,
    createCar,
    bookCar,
};
