const Booking = require('../models/Booking');
const Car = require('../models/Car');

const createBooking = async (req, res) => {
    try {
        const { car_id, user_name, user_email, user_contact, selected_color, emi_details } = req.body;

        if (!car_id || !user_name || !user_email || !user_contact) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Normalize color: treat empty strings/undefined as null for consistent matching
        const normalizedColor = (selected_color && selected_color.trim() !== '') ? selected_color : null;

        // Check for duplicate booking (same car, same email, same color)
        const existingBooking = await Booking.findOne({
            where: {
                car_id,
                user_email,
                selected_color: normalizedColor
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

        // Sanitize and validate emi_details if provided
        let sanitizedEmiDetails = null;
        if (emi_details && emi_details.opted === true) {
            sanitizedEmiDetails = {
                opted: true,
                tenure: parseInt(emi_details.tenure) || null,
                downPaymentPct: parseInt(emi_details.downPaymentPct) || null,
                monthlyEmi: parseInt(emi_details.monthlyEmi) || null,
                annualRate: parseFloat(emi_details.annualRate) || 9.5
            };
        }

        const booking = await Booking.create({
            car_id,
            user_name,
            user_email,
            user_contact,
            selected_color: normalizedColor,
            emi_details: sanitizedEmiDetails
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

        // If the booking was previously Accepted and now moved to Pending or Rejected, reset car status
        if (oldStatus === 'Accepted' && (status === 'Pending' || status === 'Rejected') && booking.car) {
            await Car.update(
                { availability_status: 'Available' },
                { where: { _id: booking.car_id } }
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