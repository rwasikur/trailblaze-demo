const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Car = require('./Car');

const Booking = sequelize.define('Booking', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    car_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Car,
            key: '_id'
        }
    },
    user_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_contact: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    },
    final_price: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    selected_color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // JSONB blob storing EMI plan if customer used the calculator.
    // null  → customer booked without EMI / full payment
    // { opted: true, tenure: 36, downPaymentPct: 20, monthlyEmi: 45231, annualRate: 9.5 }
    emi_details: {
        type: DataTypes.JSONB,
        defaultValue: null,
        allowNull: true
    }
}, {
    timestamps: true,
});

// Associations
Car.hasMany(Booking, { foreignKey: 'car_id', as: 'bookings' });
Booking.belongsTo(Car, { foreignKey: 'car_id', as: 'car' });

module.exports = Booking;