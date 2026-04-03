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
        image_url: "https://images.unsplash.com/photo-1618751590483-e2213e2f9dca",
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
        image_url: "https://images.unsplash.com/photo-1503376713174-889812423de8",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    },
    {
        name: "Model S Plaid Private",
        brand: "Tesla",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Electric",
        seating_capacity: 5,
        price_per_day: 18000,
        description: "Tesla Model S Plaid reserved for private fleet — tri-motor performance with full autopilot.",
        image_url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    },
    {
        name: "Range Rover Autobiography Private",
        brand: "Land Rover",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Diesel",
        seating_capacity: 5,
        price_per_day: 20000,
        description: "Range Rover Autobiography in private fleet — executive SUV with premium cabin.",
        image_url: "https://images.unsplash.com/photo-1519245659620-e859806a8d3b",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    },
    {
        name: "Continental GT Private",
        brand: "Bentley",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 35000,
        description: "Bentley Continental GT exclusively for private members — handcrafted luxury grand tourer.",
        image_url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    },
    {
        name: "Urus Private",
        brand: "Lamborghini",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 30000,
        description: "Lamborghini Urus restricted to private fleet — super SUV with 650hp twin-turbo V8.",
        image_url: "https://images.unsplash.com/photo-1621135802920-133df287f89c",
        secondary_images: [],
        availability_status: "Available",
        requested_by: "",
        clickCount: 0
    }
];

const seedPrivate = async () => {
    try {
        console.log("Running private database seeding (Postgres/Sequelize)...");
        await connectDB();

        await Car.sync({ alter: true });

        await Car.destroy({ where: {}, truncate: true });
        console.log("Existing cars table wiped.");

        await Car.bulkCreate(private_cars);
        console.log("Private seed data loaded!");

        process.exit(0);
    } catch (err) {
        console.error("Error seeding private cars:", err);
        process.exit(1);
    }
};

seedPrivate();
