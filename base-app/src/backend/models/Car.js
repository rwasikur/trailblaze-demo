const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    mileage: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String },
    clickCount: { type: Number, default: 0 } // Hidden from public APIs
}, { timestamps: true });

carSchema.index({ make: 'text', model: 'text', description: 'text' });

module.exports = mongoose.model('Car', carSchema);
