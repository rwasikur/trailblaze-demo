const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Car = require('./Car');

const Offer = sequelize.define('Offer', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    badge_text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: '',
    },
    car_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Car,
            key: '_id'
        }
    },
    discount_percent: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    savings_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    discount_label: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    activation_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    theme: {
        type: DataTypes.ENUM('Signature', 'Summer', 'Anniversary', 'Electric', 'Clearance'),
        defaultValue: 'Signature',
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    webhook_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

Car.hasMany(Offer, { foreignKey: 'car_id', as: 'offers' });
Offer.belongsTo(Car, { foreignKey: 'car_id', as: 'car' });

module.exports = Offer;