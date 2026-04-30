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
    }
}, {
    timestamps: true,
});

// Associations
Car.hasMany(Booking, { foreignKey: 'car_id', as: 'bookings' });
Booking.belongsTo(Car, { foreignKey: 'car_id', as: 'car' });

module.exports = Booking;
