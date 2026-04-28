const Car = require('../models/Car');
const SaleHistory = require('../models/SaleHistory');

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
            car.name = req.body.name || car.name;
            car.brand = req.body.brand || car.brand;
            car.model_year = req.body.model_year ? parseInt(req.body.model_year) : car.model_year;
            car.transmission = req.body.transmission || car.transmission;
            car.fuel_type = req.body.fuel_type || car.fuel_type;
            car.seating_capacity = req.body.seating_capacity ? parseInt(req.body.seating_capacity) : car.seating_capacity;
            car.price_per_day = req.body.price_per_day ? parseInt(req.body.price_per_day) : car.price_per_day;
            car.range = req.body.range !== undefined ? req.body.range : car.range;
            car.body_type = req.body.body_type || car.body_type;
            car.mileage = req.body.mileage !== undefined ? req.body.mileage : car.mileage;
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

            const updatedCar = await car.save();
            res.json(updatedCar);
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

const getFleetAnalytics = async (req, res) => {
    try {
        const cars = await Car.findAll({
            attributes: [
                '_id',
                'brand',
                'model_year',
                'transmission',
                'fuel_type',
                'price_per_day',
                'condition',
                'availability_status',
                'body_type',
                'registration_city',
                'insurance_validity'
            ],
            raw: true
        });

        const totalFleet = cars.length;
        const currentYear = new Date().getFullYear();
        const now = new Date();
        const soon = new Date();
        soon.setDate(soon.getDate() + 30);

        const percentageOfFleet = (count) => (
            totalFleet === 0 ? 0 : Math.round((count / totalFleet) * 100)
        );

        const countBy = (field, fallback = 'Unknown') => cars.reduce((acc, car) => {
            const key = car[field] || fallback;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const toDistribution = (counts, keyName) => Object.entries(counts)
            .map(([key, count]) => ({
                [keyName]: key,
                count,
                percentage: percentageOfFleet(count)
            }))
            .sort((a, b) => b.count - a.count);

        const parseInsuranceDate = (value) => {
            if (!value) return null;
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        };

        const statusCounts = countBy('availability_status');
        const conditionCounts = countBy('condition');
        const fuelCounts = countBy('fuel_type');
        const bodyTypeCounts = countBy('body_type');
        const brandCounts = countBy('brand');
        const transmissionCounts = countBy('transmission');
        const cityCounts = countBy('registration_city');

        const availableCars = cars.filter(car => car.availability_status === 'Available');
        const availableCount = availableCars.length;
        const unavailableCount = totalFleet - availableCount;

        const totalDailyRate = cars.reduce((sum, car) => {
            return sum + (Number(car.price_per_day) || 0);
        }, 0);

        const availableDailyRate = availableCars.reduce((sum, car) => {
            return sum + (Number(car.price_per_day) || 0);
        }, 0);

        const averageDailyRate = totalFleet === 0
            ? 0
            : Math.round(totalDailyRate / totalFleet);

        const validYears = cars
            .map(car => Number(car.model_year))
            .filter(year => Number.isFinite(year) && year > 0);

        const averageFleetAge = validYears.length === 0
            ? 0
            : Math.round(validYears.reduce((sum, year) => sum + (currentYear - year), 0) / validYears.length);
        const oldestModelYear = validYears.length ? Math.min(...validYears) : null;
        const newestModelYear = validYears.length ? Math.max(...validYears) : null;

        const insuranceDates = cars
            .map(car => parseInsuranceDate(car.insurance_validity))
            .filter(Boolean);

        const expiredInsuranceCount = insuranceDates.filter(date => date < now).length;
        const insuranceExpiringSoonCount = insuranceDates.filter(date => date >= now && date <= soon).length;

        const totalVehiclesSold = await SaleHistory.count() || 0;
        const totalSalesRevenue = await SaleHistory.sum('price') || 0;

        res.json({
            totalFleet,
            availableCount,
            unavailableCount,
            availabilityRate: percentageOfFleet(availableCount),
            availableDailyRate,
            averageDailyRate,
            averageFleetAge,
            oldestModelYear,
            newestModelYear,
            expiredInsuranceCount,
            insuranceExpiringSoonCount,
            totalVehiclesSold,
            totalSalesRevenue,
            statusDistribution: toDistribution(statusCounts, 'status'),
            conditionDistribution: toDistribution(conditionCounts, 'condition'),
            fuelTypeDistribution: toDistribution(fuelCounts, 'fuelType'),
            bodyTypeDistribution: toDistribution(bodyTypeCounts, 'bodyType'),
            brandDistribution: toDistribution(brandCounts, 'brand').slice(0, 8),
            transmissionDistribution: toDistribution(transmissionCounts, 'transmission'),
            registrationCityDistribution: toDistribution(cityCounts, 'city').slice(0, 8)
        });
    } catch (err) {
        res.status(500).json({ message: 'Unable to load fleet analytics' });
    }
};

module.exports = { getAllCars, updateCarStatus, updateCar, getFleetAnalytics };
