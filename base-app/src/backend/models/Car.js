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
    price: { type: DataTypes.INTEGER, allowNull: false },
    range: { type: DataTypes.STRING },
    body_type: { type: DataTypes.STRING },
    mileage: { type: DataTypes.STRING },
    total_distance_covered: { type: DataTypes.STRING },
    exterior_color: { type: DataTypes.STRING },
    interior_color: { type: DataTypes.STRING },
    number_of_owners: { type: DataTypes.INTEGER },
    registration_city: { type: DataTypes.STRING },
    insurance_validity: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    image_url: { type: DataTypes.STRING },
    secondary_images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    seller_name: { type: DataTypes.STRING, defaultValue: 'TrailblazeAuto Dealership' },
    seller_email: { type: DataTypes.STRING, defaultValue: 'contact@trailblazeauto.com' },
    condition: {
        type: DataTypes.ENUM('New', 'Used'),
        defaultValue: 'New'
    },
    past_owners: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    availability_status: { type: DataTypes.STRING, defaultValue: 'Available' },
}, {
    timestamps: true,
});

module.exports = Car;
