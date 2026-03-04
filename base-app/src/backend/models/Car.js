const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Car = sequelize.define('Car', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    model_year: { type: DataTypes.INTEGER, allowNull: false },
    transmission: { type: DataTypes.STRING, allowNull: false },
    fuel_type: { type: DataTypes.STRING, allowNull: false },
    seating_capacity: { type: DataTypes.INTEGER, allowNull: false },
    price_per_day: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT },
    image_url: { type: DataTypes.STRING },
    secondary_images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    availability_status: { type: DataTypes.STRING, defaultValue: 'Available' }, // 'Available', 'Pending', 'Unavailable'
    requested_by: { type: DataTypes.STRING, defaultValue: '' },
    clickCount: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['name', 'brand']
        }
    ]
});

module.exports = Car;
