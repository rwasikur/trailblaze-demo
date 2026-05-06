const Car = require('../models/Car');

const getAllCars = async (req, res) => {
    try {
        const cars = await Car.findAll({ order: [['createdAt', 'DESC']] });
        res.json(cars);
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const updateCarStatus = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (car) {
            car.availability_status = req.body.status || car.availability_status;
            await car.save();
            res.json(car);
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const updateCar = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (car) {
            // Validation
            if (req.body.name === "" || req.body.brand === "" || req.body.image_url === "") {
                return res.status(400).json({ message: "Name, Brand, and Main Image cannot be empty." });
            }

            car.name = req.body.name || car.name;
            car.brand = req.body.brand || car.brand;
            car.model_year = req.body.model_year ? parseInt(req.body.model_year) : car.model_year;
            car.transmission = req.body.transmission || car.transmission;
            car.fuel_type = req.body.fuel_type || car.fuel_type;
            car.seating_capacity = req.body.seating_capacity ? parseInt(req.body.seating_capacity) : car.seating_capacity;
            car.price = req.body.price ? parseInt(req.body.price) : car.price;
            car.range = req.body.range !== undefined ? req.body.range : car.range;
            car.body_type = req.body.body_type || car.body_type;
            car.mileage = req.body.mileage !== undefined ? req.body.mileage : car.mileage;
            car.total_distance_covered = req.body.total_distance_covered !== undefined ? req.body.total_distance_covered : car.total_distance_covered;
            car.exterior_color = req.body.exterior_color || car.exterior_color;
            car.interior_color = req.body.interior_color || car.interior_color;

            // Sanitize number_of_owners
            if (req.body.condition === 'New' || (req.body.condition === undefined && car.condition === 'New')) {
                car.number_of_owners = 0;
            } else if (req.body.number_of_owners !== undefined) {
                car.number_of_owners = req.body.number_of_owners === "" ? 0 : req.body.number_of_owners;
            }

            car.registration_city = req.body.registration_city || car.registration_city;
            car.insurance_validity = req.body.insurance_validity || car.insurance_validity;
            car.description = req.body.description || car.description;
            car.image_url = req.body.image_url || car.image_url;
            car.secondary_images = req.body.secondary_images !== undefined ? req.body.secondary_images : car.secondary_images;
            car.availability_status = req.body.availability_status || car.availability_status;
            car.condition = req.body.condition || car.condition;
            car.available_colors = req.body.available_colors || car.available_colors;

            const updatedCar = await car.save();
            res.json(updatedCar);
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

module.exports = { getAllCars, updateCarStatus, updateCar };
