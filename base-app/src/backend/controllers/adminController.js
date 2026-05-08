const Car = require('../models/Car');
const Booking = require('../models/Booking');

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
            const oldStatus = car.availability_status;
            const newStatus = req.body.status || car.availability_status;

            car.availability_status = newStatus;
            await car.save();

            // Sync bookings based on manual status change
            if (oldStatus === 'Sold' && newStatus === 'Available') {
                await Booking.update(
                    { status: 'Pending' },
                    { where: { car_id: car._id, status: 'Accepted' } }
                );
            } else if (oldStatus === 'Available' && newStatus === 'Sold') {
                await Booking.update(
                    { status: 'Rejected' },
                    { where: { car_id: car._id, status: 'Pending' } }
                );
            }

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

            const oldStatus = car.availability_status;
            const newStatus = req.body.availability_status || car.availability_status;

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
            car.available_colors = req.body.available_colors || car.available_colors;

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
            car.availability_status = newStatus;
            car.condition = req.body.condition || car.condition;

            const updatedCar = await car.save();

            // Sync bookings based on manual status change
            if (oldStatus === 'Sold' && newStatus === 'Available') {
                await Booking.update(
                    { status: 'Pending' },
                    { where: { car_id: car._id, status: 'Accepted' } }
                );
            } else if (oldStatus === 'Available' && newStatus === 'Sold') {
                await Booking.update(
                    { status: 'Rejected' },
                    { where: { car_id: car._id, status: 'Pending' } }
                );
            }

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
        const [cars, bookings] = await Promise.all([
            Car.findAll({ raw: true }),
            Booking.findAll({
                include: [{ model: Car, as: 'car' }],
                order: [['createdAt', 'DESC']]
            })
        ]);

        const now = new Date();
        const soon = new Date();
        soon.setDate(soon.getDate() + 30);

        const query = req.query || {};
        const range = query.range || 'all';
        const granularity = ['day', 'week', 'month'].includes(query.granularity) ? query.granularity : 'month';

        const parseDate = (value) => {
            if (!value) return null;
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        };

        const getPeriod = () => {
            if (range === 'custom') {
                const start = parseDate(query.startDate);
                const end = parseDate(query.endDate);
                if (start && end) {
                    end.setHours(23, 59, 59, 999);
                    return { start, end };
                }
            }

            const days = { '7': 7, '30': 30, '90': 90 }[range];
            if (!days) return { start: null, end: null };

            const start = new Date(now);
            start.setDate(start.getDate() - days + 1);
            start.setHours(0, 0, 0, 0);
            return { start, end: now };
        };

        const period = getPeriod();
        const previousPeriod = period.start && period.end
            ? {
                start: new Date(period.start.getTime() - (period.end.getTime() - period.start.getTime())),
                end: new Date(period.start.getTime() - 1)
            }
            : { start: null, end: null };

        const inPeriod = (value, activePeriod = period) => {
            const date = parseDate(value);
            if (!date) return false;
            if (activePeriod.start && date < activePeriod.start) return false;
            if (activePeriod.end && date > activePeriod.end) return false;
            return true;
        };

        const matchesFilter = (car) => {
            if (!car) return false;
            if (query.status && car.availability_status !== query.status) return false;
            if (query.brand && car.brand !== query.brand) return false;
            if (query.fuelType && car.fuel_type !== query.fuelType) return false;
            if (query.bodyType && car.body_type !== query.bodyType) return false;
            if (query.condition && car.condition !== query.condition) return false;
            if (query.city && car.registration_city !== query.city) return false;
            return true;
        };

        const pct = (count, total) =>
            total === 0 ? 0 : Math.round((count / total) * 100);

        const money = (value) => Number(value) || 0;

        const countBy = (items, getter, fallback = 'Unknown') => {
            return items.reduce((acc, item) => {
                const key = getter(item) || fallback;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});
        };

        const sumBy = (items, getter) => {
            return items.reduce((sum, item) => sum + money(getter(item)), 0);
        };

        const distribution = (counts, keyName, total) => {
            return Object.entries(counts)
                .map(([key, count]) => ({
                    [keyName]: key,
                    count,
                    percentage: pct(count, total)
                }))
                .sort((a, b) => b.count - a.count);
        };

        const getCarFromBooking = (booking) => booking.car ? booking.car.get({ plain: true }) : null;
        const getSaleDate = (booking) => booking.updatedAt || booking.createdAt;

        const filteredCars = cars.filter(matchesFilter);
        const filteredBookings = bookings
            .filter(booking => inPeriod(booking.createdAt))
            .filter(booking => matchesFilter(getCarFromBooking(booking)));
        const filteredSales = bookings
            .filter(booking => booking.status === 'Accepted')
            .filter(booking => inPeriod(getSaleDate(booking)))
            .filter(booking => matchesFilter(getCarFromBooking(booking)));

        const previousBookings = bookings
            .filter(booking => inPeriod(booking.createdAt, previousPeriod))
            .filter(booking => matchesFilter(getCarFromBooking(booking)));
        const previousSales = bookings
            .filter(booking => booking.status === 'Accepted')
            .filter(booking => inPeriod(getSaleDate(booking), previousPeriod))
            .filter(booking => matchesFilter(getCarFromBooking(booking)));

        const totalFleet = filteredCars.length;
        const availableCars = filteredCars.filter(car => car.availability_status === 'Available');
        const soldCars = filteredCars.filter(car => car.availability_status === 'Sold');
        const pendingBookings = filteredBookings.filter(booking => booking.status === 'Pending');
        const acceptedBookings = filteredBookings.filter(booking => booking.status === 'Accepted');
        const rejectedBookings = filteredBookings.filter(booking => booking.status === 'Rejected');

        const vehicleName = (car) => car ? `${car.brand} ${car.name}` : 'Unknown vehicle';

        const carRows = filteredCars.map(car => ({
            carId: car._id,
            vehicle: vehicleName(car),
            brand: car.brand,
            status: car.availability_status,
            condition: car.condition,
            fuelType: car.fuel_type,
            bodyType: car.body_type,
            city: car.registration_city || 'Unregistered',
            modelYear: car.model_year,
            price: money(car.price),
            createdAt: car.createdAt,
            views: car.views || 0
        }));

        const bookingRows = filteredBookings.map(booking => {
            const car = getCarFromBooking(booking);
            return {
                bookingId: booking._id,
                customer: booking.user_name,
                email: booking.user_email,
                contact: booking.user_contact,
                status: booking.status,
                vehicle: vehicleName(car),
                brand: car?.brand || 'Unknown',
                price: money(car?.price),
                createdAt: booking.createdAt,
                ageDays: Math.floor((now - new Date(booking.createdAt)) / (1000 * 60 * 60 * 24))
            };
        });

        const saleRows = filteredSales.map(booking => {
            const car = getCarFromBooking(booking);
            return {
                saleId: booking._id,
                vehicle: vehicleName(car),
                buyer: booking.user_name,
                seller: car?.seller_name || 'TrailblazeAuto Dealership',
                status: 'Sold',
                price: money(car?.price),
                saleDate: getSaleDate(booking)
            };
        });

        const bucketKey = (dateValue) => {
            const date = parseDate(dateValue);
            if (!date) return null;

            if (granularity === 'day') {
                return date.toISOString().slice(0, 10);
            }

            if (granularity === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                return weekStart.toISOString().slice(0, 10);
            }

            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        };

        const totalInventoryValue = sumBy(filteredCars, car => car.price);
        const availableInventoryValue = sumBy(availableCars, car => car.price);
        const soldInventoryValue = sumBy(soldCars, car => car.price);
        const pendingPipelineValue = sumBy(pendingBookings, booking => getCarFromBooking(booking)?.price);
        const acceptedBookingValue = sumBy(acceptedBookings, booking => getCarFromBooking(booking)?.price);
        const totalClientClicks = sumBy(filteredCars, car => car.views || 0);

        const totalSalesRevenue = sumBy(filteredSales, booking => getCarFromBooking(booking)?.price) || sumBy(soldCars, car => car.price);
        const previousSalesRevenue = sumBy(previousSales, booking => getCarFromBooking(booking)?.price);
        const previousBookingCount = previousBookings.length;

        const change = (current, previous) => ({
            current,
            previous,
            delta: current - previous,
            deltaPercentage: previous === 0 ? null : Math.round(((current - previous) / previous) * 100)
        });

        const validModelYears = filteredCars
            .map(car => Number(car.model_year))
            .filter(year => Number.isFinite(year) && year > 0);

        const averageFleetAge = validModelYears.length === 0
            ? 0
            : Math.round(
                validModelYears.reduce((sum, year) => sum + (now.getFullYear() - year), 0) /
                validModelYears.length
            );

        const insuranceDates = filteredCars
            .map(car => parseDate(car.insurance_validity))
            .filter(Boolean);

        const bookingsByCarId = countBy(filteredBookings, booking => booking.car_id);
        const demandByVehicle = Object.entries(bookingsByCarId)
            .map(([carId, bookingCount]) => {
                const car = filteredCars.find(item => item._id === carId) || cars.find(item => item._id === carId);
                return {
                    carId,
                    vehicle: vehicleName(car),
                    brand: car?.brand || 'Unknown',
                    bookingCount,
                    price: money(car?.price)
                };
            })
            .sort((a, b) => b.bookingCount - a.bookingCount)
            .slice(0, 10);

        const bookingsByBrand = countBy(filteredBookings, booking => getCarFromBooking(booking)?.brand);
        const bookingsByFuelType = countBy(filteredBookings, booking => getCarFromBooking(booking)?.fuel_type);
        const bookingsByBodyType = countBy(filteredBookings, booking => getCarFromBooking(booking)?.body_type);

        const pendingBookingAge = pendingBookings
            .map(booking => {
                const car = getCarFromBooking(booking);
                return {
                    bookingId: booking._id,
                    customer: booking.user_name,
                    email: booking.user_email,
                    vehicle: vehicleName(car),
                    price: money(car?.price),
                    createdAt: booking.createdAt,
                    ageDays: Math.floor((now - new Date(booking.createdAt)) / (1000 * 60 * 60 * 24))
                };
            })
            .sort((a, b) => b.ageDays - a.ageDays);

        const salesByPeriod = filteredSales.reduce((acc, booking) => {
            const key = bucketKey(getSaleDate(booking));
            if (!key) return acc;

            if (!acc[key]) {
                acc[key] = { period: key, month: key, revenue: 0, vehiclesSold: 0 };
            }

            acc[key].revenue += money(getCarFromBooking(booking)?.price);
            acc[key].vehiclesSold += 1;
            return acc;
        }, {});

        const bookingsByPeriod = filteredBookings.reduce((acc, booking) => {
            const key = bucketKey(booking.createdAt);
            if (!key) return acc;

            if (!acc[key]) {
                acc[key] = { period: key, month: key, bookings: 0 };
            }

            acc[key].bookings += 1;
            return acc;
        }, {});

        const unique = (values) => [...new Set(values.filter(Boolean))].sort();

        res.json({
            period: {
                range,
                startDate: period.start,
                endDate: period.end,
                granularity
            },
            filters: {
                status: query.status || '',
                brand: query.brand || '',
                fuelType: query.fuelType || '',
                bodyType: query.bodyType || '',
                condition: query.condition || '',
                city: query.city || ''
            },
            filterOptions: {
                statuses: unique(cars.map(car => car.availability_status)),
                brands: unique(cars.map(car => car.brand)),
                fuelTypes: unique(cars.map(car => car.fuel_type)),
                bodyTypes: unique(cars.map(car => car.body_type)),
                conditions: unique(cars.map(car => car.condition)),
                cities: unique(cars.map(car => car.registration_city))
            },
            totalFleet,
            availableCount: availableCars.length,
            unavailableCount: totalFleet - availableCars.length,
            soldCount: soldCars.length,
            availabilityRate: pct(availableCars.length, totalFleet),
            sellThroughRate: pct(soldCars.length, totalFleet),

            totalInventoryValue,
            availableInventoryValue,
            soldInventoryValue,
            averageListingPrice: totalFleet === 0 ? 0 : Math.round(totalInventoryValue / totalFleet),

            averageFleetAge,
            oldestModelYear: validModelYears.length ? Math.min(...validModelYears) : null,
            newestModelYear: validModelYears.length ? Math.max(...validModelYears) : null,

            expiredInsuranceCount: insuranceDates.filter(date => date < now).length,
            insuranceExpiringSoonCount: insuranceDates.filter(date => date >= now && date <= soon).length,

            totalClientClicks,

            totalBookings: filteredBookings.length,
            pendingBookings: pendingBookings.length,
            acceptedBookings: acceptedBookings.length,
            rejectedBookings: rejectedBookings.length,
            bookingConversionRate: pct(acceptedBookings.length, filteredBookings.length),
            pendingPipelineValue,
            acceptedBookingValue,

            totalVehiclesSold: filteredSales.length || soldCars.length,
            totalSalesRevenue,
            comparisons: {
                bookings: change(filteredBookings.length, previousBookingCount),
                salesRevenue: change(totalSalesRevenue, previousSalesRevenue),
                acceptedBookings: change(acceptedBookings.length, previousBookings.filter(booking => booking.status === 'Accepted').length)
            },

            statusDistribution: distribution(countBy(filteredCars, car => car.availability_status), 'status', totalFleet),
            conditionDistribution: distribution(countBy(filteredCars, car => car.condition), 'condition', totalFleet),
            fuelTypeDistribution: distribution(countBy(filteredCars, car => car.fuel_type), 'fuelType', totalFleet),
            bodyTypeDistribution: distribution(countBy(filteredCars, car => car.body_type), 'bodyType', totalFleet),
            brandDistribution: distribution(countBy(filteredCars, car => car.brand), 'brand', totalFleet).slice(0, 8),
            transmissionDistribution: distribution(countBy(filteredCars, car => car.transmission), 'transmission', totalFleet),
            registrationCityDistribution: distribution(countBy(filteredCars, car => car.registration_city), 'city', totalFleet).filter(item => item.city !== 'Unknown').slice(0, 8),

            bookingStatusDistribution: distribution(countBy(filteredBookings, booking => booking.status), 'status', filteredBookings.length),
            demandByVehicle,
            demandByBrand: distribution(bookingsByBrand, 'brand', filteredBookings.length).slice(0, 8),
            demandByFuelType: distribution(bookingsByFuelType, 'fuelType', filteredBookings.length),
            demandByBodyType: distribution(bookingsByBodyType, 'bodyType', filteredBookings.length),

            carRows,
            bookingRows,
            saleRows,
            pendingBookingAge,
            salesByMonth: Object.values(salesByPeriod).sort((a, b) => a.period.localeCompare(b.period)),
            bookingsByMonth: Object.values(bookingsByPeriod).sort((a, b) => a.period.localeCompare(b.period))
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ message: 'Unable to load fleet analytics' });
    }
};

module.exports = { getAllCars, updateCarStatus, updateCar, getFleetAnalytics };
