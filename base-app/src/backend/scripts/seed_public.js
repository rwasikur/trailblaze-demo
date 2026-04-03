const { connectDB } = require('../config/db');
const Car = require('../models/Car');

const public_cars = [
    {
        name: "Model S Plaid",
        brand: "Tesla",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Electric",
        seating_capacity: 5,
        price_per_day: 89990,
        range: "396 mi",
        body_type: "Sedan",
        mileage: "12,400 mi",
        exterior_color: "Pearl White",
        interior_color: "Black",
        number_of_owners: 1,
        registration_city: "San Francisco",
        insurance_validity: "Dec 2025",
        description: "The Tesla Model S Plaid is the quickest production car ever made. With three electric motors and over 1,000 horsepower, it accelerates 0-60 mph in just 1.99 seconds. Combined with a 396-mile range and the latest Autopilot features, it redefines what a performance sedan can be.",
        image_url: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=1200",
        secondary_images: [
            "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1200"
        ],
        seller_name: "TrailblazeAuto Premium",
        availability_status: "Available"
    },
    {
        name: "Cayenne GTS",
        brand: "Porsche",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 112000,
        range: "24 kmpl",
        body_type: "SUV",
        mileage: "8,200 mi",
        exterior_color: "Carmine Red",
        interior_color: "Cognac Brown",
        number_of_owners: 1,
        registration_city: "Los Angeles",
        insurance_validity: "Mar 2026",
        description: "The Porsche Cayenne GTS sits at the pinnacle of performance SUVs. Its twin-turbocharged 4.0L V8 produces 473 hp, sprinting 0-60 in 3.7 seconds while perfectly balancing everyday practicality with racetrack capability.",
        image_url: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&q=80&w=1200",
        secondary_images: [
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200"
        ],
        seller_name: "TrailblazeAuto Premium",
        availability_status: "Available"
    },
    {
        name: "M3 Competition",
        brand: "BMW",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 84000,
        range: "20 kmpl",
        body_type: "Sedan",
        mileage: "15,600 mi",
        exterior_color: "Brooklyn Grey",
        interior_color: "Black Merino Leather",
        number_of_owners: 1,
        registration_city: "New York",
        insurance_validity: "Jan 2026",
        description: "The BMW M3 Competition xDrive is the pinnacle of sports sedan performance. Its 3.0L twin-turbo inline-6 produces 503 hp and 479 lb-ft of torque. The M3 delivers surgical precision and explosive power in all conditions.",
        image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200",
        secondary_images: [],
        seller_name: "TrailblazeAuto Elite",
        availability_status: "Available"
    },
    {
        name: "GT 63 S AMG",
        brand: "Mercedes-Benz",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 165000,
        range: "18 kmpl",
        body_type: "Coupe",
        mileage: "3,100 mi",
        exterior_color: "Obsidian Black",
        interior_color: "Red Nappa",
        number_of_owners: 1,
        registration_city: "Miami",
        insurance_validity: "Nov 2026",
        description: "The Mercedes-AMG GT 63 S is a 4-door grand touring sports car built for those who want it all - a 630 hp handcrafted V8, a coupe silhouette, and four spacious seats.",
        image_url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200",
        secondary_images: [],
        seller_name: "TrailblazeAuto AMG Center",
        availability_status: "Available"
    },
    {
        name: "Giulia Quadrifoglio",
        brand: "Alfa Romeo",
        model_year: 2022,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 79900,
        range: "19 kmpl",
        body_type: "Sedan",
        mileage: "22,500 mi",
        exterior_color: "Alfa Red",
        interior_color: "Black Alcantara",
        number_of_owners: 2,
        registration_city: "Chicago",
        insurance_validity: "Jun 2025",
        description: "The Alfa Romeo Giulia Quadrifoglio is the most driver-focused sports sedan money can buy. Its Ferrari-derived 2.9L twin-turbo V6 produces 505 hp and propels the car to 60 mph in just 3.8 seconds.",
        image_url: "https://images.unsplash.com/photo-1597007066704-67bf2068d5b2?auto=format&fit=crop&q=80&w=1200",
        secondary_images: [],
        seller_name: "TrailblazeAuto Classics",
        availability_status: "Booked"
    },
    {
        name: "Defender 110",
        brand: "Land Rover",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Diesel",
        seating_capacity: 7,
        price_per_day: 74900,
        range: "16 kmpl",
        body_type: "SUV",
        mileage: "18,000 mi",
        exterior_color: "Fuji White",
        interior_color: "Light Oyster",
        number_of_owners: 1,
        registration_city: "Denver",
        insurance_validity: "Sep 2025",
        description: "The Land Rover Defender 110 is built for legendary adventures. With Terrain Response 2, ClearSight Ground View, and Wade Sensing, it is the most capable Defender ever - yet also the most liveable with 7 seats.",
        image_url: "https://images.unsplash.com/photo-1588459474892-9e3ccb7d2b5f?auto=format&fit=crop&q=80&w=1200",
        secondary_images: [],
        seller_name: "TrailblazeAuto 4x4",
        availability_status: "Available"
    },
    {
        name: "Panamera 4S",
        brand: "Porsche",
        model_year: 2022,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 108000,
        range: "22 kmpl",
        body_type: "Sedan",
        mileage: "14,300 mi",
        exterior_color: "Jet Black Metallic",
        interior_color: "Luxor Beige",
        number_of_owners: 1,
        registration_city: "Seattle",
        insurance_validity: "Aug 2025",
        description: "The Porsche Panamera 4S blends supercar performance with the comfort of a luxury saloon. Powered by a 2.9L twin-turbo V6 producing 444 hp, it sprints 0-60 in 3.9 seconds.",
        image_url: "https://images.unsplash.com/photo-1547744152-14d985cb937f?auto=format&fit=crop&q=80&w=1200",
        secondary_images: [],
        seller_name: "TrailblazeAuto Premium",
        availability_status: "Available"
    }
];

const seedPublic = async () => {
    try {
        console.log("Running public database seeding...");
        await connectDB();
        await Car.sync({ alter: true });

        let created = 0;
        let updated = 0;

        for (const carData of public_cars) {
            const existingCar = await Car.findOne({
                where: {
                    name: carData.name,
                    brand: carData.brand,
                    model_year: carData.model_year,
                }
            });

            if (existingCar) {
                await existingCar.update({
                    ...carData,
                    secondary_images: carData.secondary_images || [],
                });
                updated += 1;
            } else {
                await Car.create({
                    ...carData,
                    secondary_images: carData.secondary_images || [],
                });
                created += 1;
            }
        }

        console.log(`Public seed sync complete. Created: ${created}, Updated: ${updated}`);
        process.exit(0);
    } catch (err) {
        console.error("Error seeding public cars:", err);
        process.exit(1);
    }
};

seedPublic();
