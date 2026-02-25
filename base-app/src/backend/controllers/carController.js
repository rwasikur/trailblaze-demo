const Car = require('../models/Car');

const getCars = async (req, res) => {
    try {
        const page = Number(req.query.pageNumber) || 1;
        const pageSize = Number(req.query.pageSize) || 10;

        const count = await Car.countDocuments();

        const cars = await Car.find({})
            .select('-clickCount')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ cars, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).select('-clickCount');

        if (car) {
            await Car.updateOne({ _id: req.params.id }, { $inc: { clickCount: 1 } });
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
        const { make, model, year, price, mileage, description, imageUrl } = req.body;

        const car = new Car({
            make,
            model,
            year,
            price,
            mileage,
            description,
            imageUrl
        });

        const createdCar = await car.save();
        res.status(201).json(createdCar);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create car: ' + err.message });
    }
};

module.exports = {
    getCars,
    getCarById,
    createCar,
};
