const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model_year: { type: Number, required: true },
    transmission: { type: String, required: true },
    fuel_type: { type: String, required: true },
    seating_capacity: { type: Number, required: true },
    price_per_day: { type: Number, required: true },
    range: { type: String },
    body_type: { type: String },
    mileage: { type: String },
    exterior_color: { type: String },
    interior_color: { type: String },
    number_of_owners: { type: Number },
    registration_city: { type: String },
    insurance_validity: { type: String },
    description: { type: String },
    image_url: { type: String },
    secondary_images: [{ type: String }],
    availability_status: { type: String, default: 'Available' }, // 'Available', 'Pending', 'Unavailable'
    requested_by: { type: String, default: '' },
    clickCount: { type: Number, default: 0 } // Hidden from public APIs
}, { timestamps: true });

carSchema.index({ name: 'text', brand: 'text', description: 'text' });

module.exports = mongoose.model('Car', carSchema);
