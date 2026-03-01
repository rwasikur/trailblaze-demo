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

module.exports = { getDashboardStats, getAllCars, deleteCar, updateCarStatus };
