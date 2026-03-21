const { connectDB } = require('../config/db');
const Car = require('../models/Car');

const private_cars = [
    {
        name: "S-Class Private",
        brand: "Mercedes",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Hybrid",
        seating_capacity: 4,
        price_per_day: 15000,
        description: "Luxurious Mercedes exclusively for private fleet.",
        image_url: "/car1.webp",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    },
    {
        name: "911 Carrera Private",
        brand: "Porsche",
        model_year: 2023,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 25000,
        description: "Porsche 911 restricted to premium private users.",
        image_url: "/car2.webp",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    }
];

const seedPrivate = async () => {
    try {
        console.log("🌱 Running private database seeding (Postgres/Sequelize)...");
        await connectDB();

        // Sync models
        await Car.sync({ alter: true });

        const count = await Car.count();
        if (count === 0) {
            await Car.bulkCreate(private_cars);
            console.log("✅ Private seed data loaded!");
        } else {
            console.log("ℹ️  Cars collection already seeded.");
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding private cars:", err);
        process.exit(1);
    }
};

seedPrivate();
