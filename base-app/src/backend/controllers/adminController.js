const Car = require('../models/Car');

const getDashboardStats = async (req, res) => {
    try {
        const totalCars = await Car.countDocuments();
        const availableCars = await Car.countDocuments({ availability_status: 'Available' });
        const pendingCars = await Car.countDocuments({ availability_status: 'Pending' });
        const unavailableCars = await Car.countDocuments({ availability_status: 'Unavailable' });

        // Generate true revenue from currently blocked/booked cars' daily price
        const unavailableCarsDocs = await Car.find({ availability_status: 'Unavailable' });
        const totalRevenue = unavailableCarsDocs.reduce((acc, car) => acc + (car.price_per_day || 0), 0);

        const activeBookings = pendingCars; // Booking Requests
        const activeRentals = unavailableCars; // Active in Using
        const fleetStatus = `${availableCars} / ${totalCars} Ready`;

        res.json({
            activeBookings,
            activeRentals,
            fleetStatus,
            totalRevenue
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const updateCarStatus = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (car) {
            car.availability_status = req.body.status || car.availability_status;
            if (car.availability_status === 'Available') {
                car.requested_by = ''; // Clear requested_by if made available again
            }
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
        const car = await Car.findById(req.params.id);
        if (car) {
            car.name = req.body.name || car.name;
            car.brand = req.body.brand || car.brand;
            car.model_year = req.body.model_year || car.model_year;
            car.transmission = req.body.transmission || car.transmission;
            car.fuel_type = req.body.fuel_type || car.fuel_type;
            car.seating_capacity = req.body.seating_capacity || car.seating_capacity;
            car.price_per_day = req.body.price_per_day || car.price_per_day;
            car.range = req.body.range !== undefined ? req.body.range : car.range;
            car.body_type = req.body.body_type || car.body_type;
            car.description = req.body.description || car.description;
            car.image_url = req.body.image_url || car.image_url;
            car.secondary_images = req.body.secondary_images !== undefined ? req.body.secondary_images : car.secondary_images;
            car.availability_status = req.body.availability_status || car.availability_status;

            if (car.availability_status === 'Available') {
                car.requested_by = ''; // Clear requested_by if made available again
            }

            const updatedCar = await car.save();
            res.json(updatedCar);
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find({}).sort({ createdAt: -1 });
        res.json(cars);
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (car) {
            res.json({ message: 'Car removed successfully' });
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

module.exports = { getDashboardStats, getAllCars, deleteCar, updateCarStatus, updateCar };
