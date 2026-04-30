const Booking = require('../models/Booking');
const Car = require('../models/Car');

const createBooking = async (req, res) => {
    try {
        const { car_id, user_name, user_email, user_contact } = req.body;
        
        if (!car_id || !user_name || !user_email || !user_contact) {
            return res.status(400).json({ message: 'All fields are required' });
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

        booking.status = status;
        await booking.save();

        // If accepted, mark car as Sold and reject other pending bookings
        if (status === 'Accepted' && booking.car) {
            await Car.update(
                { availability_status: 'Sold' },
                { where: { _id: booking.car_id } }
            );

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
