const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Car = require('./Car');

const SaleHistory = sequelize.define('SaleHistory', {
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
    sale_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    seller_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    buyer_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sale_status: {
        type: DataTypes.STRING,
        defaultValue: 'Sold'
    }
}, {
    timestamps: true,
});

// Associations
Car.hasMany(SaleHistory, { foreignKey: 'car_id', as: 'saleHistory' });
SaleHistory.belongsTo(Car, { foreignKey: 'car_id', as: 'car' });

module.exports = SaleHistory;