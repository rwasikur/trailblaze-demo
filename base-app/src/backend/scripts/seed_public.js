require('dotenv').config();
const { connectDB } = require('../config/db');
const Car = require('../models/Car');

const public_cars = [
    {
        name: "Civic Public",
        brand: "Honda",
        model_year: 2022,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 3000,
        description: "A very neat Honda Civic available for tracking.",
        image_url: "/honda_civic.jpg",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    },
    {
        name: "Model 3 Public",
        brand: "Tesla",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Electric",
        seating_capacity: 5,
        price_per_day: 8500,
        description: "Sleek and highly efficient electric vehicle.",
        image_url: "/tesla_model3.jpg",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    }
];

const seedPublic = async () => {
    try {
        await connectDB();
        const count = await Car.count();
        if (count === 0) {
            await Car.bulkCreate(public_cars);
            console.log("Public seed data loaded!");
        } else {
            console.log("Cars collection already seeded.");
        }
    } catch (err) {
        console.error("Error seeding public cars:", err);
    } finally {
        process.exit(0);
    }
};

seedPublic();
