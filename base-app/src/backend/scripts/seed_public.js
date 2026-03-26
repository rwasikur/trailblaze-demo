const { connectDB } = require('../config/db');
const Car = require('../models/Car');

const public_cars = [
    {
        name: "Toyota Prius",
        brand: "Toyota",
        model_year: 2022,
        transmission: "Automatic",
        fuel_type: "Hybrid",
        seating_capacity: 5,
        price_per_day: 3000,
        description: "Reliable hybrid car for daily commuting.",
        image_url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    },
    {
        name: "Honda City",
        brand: "Honda",
        model_year: 2021,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 2500,
        description: "Comfortable sedan for city rides.",
        image_url: "https://images.unsplash.com/photo-1550355291-bbee04a92027",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    },
    {
        name: "Hyundai Creta",
        brand: "Hyundai",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Diesel",
        seating_capacity: 5,
        price_per_day: 3500,
        description: "Popular SUV with great comfort and mileage.",
        image_url: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    },
    {
        name: "Maruti Swift",
        brand: "Maruti",
        model_year: 2020,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 2000,
        description: "Affordable hatchback for everyday use.",
        image_url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    },
    {
        name: "Tata Nexon EV",
        brand: "Tata",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Electric",
        seating_capacity: 5,
        price_per_day: 4000,
        description: "Eco-friendly electric SUV.",
        image_url: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    }
];

const seedPublic = async () => {
    try {
        console.log("🌱 Running public database seeding...");

        await connectDB();

        // Sync models
        await Car.sync({ alter: true });

        const count = await Car.count();

        if (count === 0) {
            await Car.bulkCreate(public_cars);
            console.log("✅ Public seed data loaded!");
        } else {
            console.log("ℹ️ Cars table already seeded.");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding public cars:", err);
        process.exit(1);
    }
};

seedPublic();
