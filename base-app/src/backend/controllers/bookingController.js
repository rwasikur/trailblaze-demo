const Booking = require('../models/Booking');
const Car = require('../models/Car');

const createBooking = async (req, res) => {
    try {
        const { car_id, user_name, user_email, user_contact } = req.body;

        if (!car_id || !user_name || !user_email || !user_contact) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check for duplicate booking
        const existingBooking = await Booking.findOne({
            where: {
                car_id,
                user_email
            }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'A booking request with this email already exists for this vehicle.' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user_email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        // Phone validation (simple numeric check)
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(user_contact)) {
            return res.status(400).json({ message: 'Invalid contact number. Must be at least 10 digits.' });
        }

        if (user_name.length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters' });
        }

        const booking = await Booking.create({
            car_id,
            user_name,
            user_email,
            user_contact
        });

        res.status(201).json({ message: 'Booking submitted successfully', booking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [{ model: Car, as: 'car' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: Car, as: 'car' }]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const oldStatus = booking.status;

        // Transitioning FROM Accepted back to Pending/Rejected
        if (oldStatus === 'Accepted' && status !== 'Accepted' && booking.car) {
            const car = await Car.findByPk(booking.car_id);
            if (car) {
                // Remove the last owner record (added when accepted)
                const updatedPastOwners = [...(car.past_owners || [])];
                updatedPastOwners.pop();
                const updatedOwnerCount = Math.max(0, (car.number_of_owners || 0) - 1);

                await car.update({
                    availability_status: 'Available',
                    past_owners: updatedPastOwners,
                    number_of_owners: updatedOwnerCount
                });

                await booking.update({ status, final_price: null });
            }
        }
        // Transitioning TO Accepted
        else if (status === 'Accepted' && booking.car) {
            const car = await Car.findByPk(booking.car_id);
            if (car) {
                const newSale = {
                    sale_date: new Date().toISOString(),
                    sale_price: car.price,
                    seller_name: 'TrailblazeAuto Dealership',
                    buyer_name: booking.user_name
                };

                const updatedPastOwners = [...(car.past_owners || []), newSale];
                const updatedOwnerCount = (car.number_of_owners || 0) + 1;

                await car.update({
                    availability_status: 'Sold',
                    past_owners: updatedPastOwners,
                    number_of_owners: updatedOwnerCount
                });

                await booking.update({ status, final_price: car.price });
            }

            // Auto-reject other pending bookings for the same car
            await Booking.update(
                { status: 'Rejected' },
                {
                    where: {
                        car_id: booking.car_id,
                        status: 'Pending',
                        _id: { [require('sequelize').Op.ne]: booking._id }
                    }
                }
            );
        } else {
            // Standard status update
            await booking.update({ status });
        }

        res.json({ message: `Booking ${status.toLowerCase()} successfully`, booking });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createBooking,
    getBookings,
    updateBookingStatus
};
