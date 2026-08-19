const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Car = require('./Car');
const Booking = require('./Booking');

const Sale = sequelize.define('Sale', {
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
    booking_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Booking,
            key: '_id'
        }
    },
    sale_price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sale_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    buyer_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    buyer_email: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true,
});

// Associations
Car.hasMany(Sale, { foreignKey: 'car_id', as: 'sales' });
Sale.belongsTo(Car, { foreignKey: 'car_id', as: 'car' });
Booking.hasOne(Sale, { foreignKey: 'booking_id', as: 'sale' });
Sale.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

module.exports = Sale;
