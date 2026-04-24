const { connectDB } = require('../config/db');
const Car = require('../models/Car');
const Admin = require('../models/Admin');
const SaleHistory = require('../models/SaleHistory');

const public_cars = [
    {
        name: "Model S Plaid",
        brand: "Tesla",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Electric",
        seating_capacity: 5,
        price_per_day: 1200,
        range: "396 mi",
        body_type: "Sedan",
        mileage: "12,400 mi",
        exterior_color: "Pearl White",
        interior_color: "Black",
        number_of_owners: 1,
        registration_city: "San Francisco",
        insurance_validity: "Dec 2025",
        description: "The Tesla Model S Plaid is the quickest production car ever made. With three electric motors and over 1,000 horsepower, it accelerates 0-60 mph in just 1.99 seconds.",
        image_url: "https://images.pexels.com/photos/11139552/pexels-photo-11139552.jpeg?auto=compress&cs=tinysrgb&w=1200",
        secondary_images: [],
        seller_name: "TrailblazeAuto Premium",
        availability_status: "Unavailable",
        discount_percentage: 15
    },
    {
        name: "Cayenne GTS",
        brand: "Porsche",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 950,
        range: "24 kmpl",
        body_type: "SUV",
        mileage: "8,200 mi",
        exterior_color: "Carmine Red",
        interior_color: "Cognac Brown",
        number_of_owners: 1,
        registration_city: "Los Angeles",
        insurance_validity: "Mar 2026",
        description: "The Porsche Cayenne GTS sits at the pinnacle of performance SUVs. Its twin-turbocharged 4.0L V8 produces 473 hp, sprinting 0-60 in 3.7 seconds.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Porsche/Porsche-Carrera-GT/785/1562843571849/front-left-side-47.jpg",
        secondary_images: [],
        seller_name: "TrailblazeAuto Premium",
        availability_status: "Available",
        discount_percentage: 10
    },
    {
        name: "M3 Competition",
        brand: "BMW",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 850,
        range: "20 kmpl",
        body_type: "Sedan",
        mileage: "15,600 mi",
        exterior_color: "Brooklyn Grey",
        interior_color: "Black Merino Leather",
        number_of_owners: 1,
        registration_city: "New York",
        insurance_validity: "Jan 2026",
        description: "The BMW M3 Competition xDrive is the pinnacle of sports sedan performance. Its 3.0L twin-turbo inline-6 produces 503 hp.",
        image_url: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1200&auto=format&fit=crop",
        secondary_images: [],
        seller_name: "TrailblazeAuto Elite",
        availability_status: "Available",
        discount_percentage: 0
    },
    {
        name: "Porsche 911 (993)",
        brand: "Porsche",
        model_year: 1995,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 2200,
        range: "14 kmpl",
        body_type: "Coupe",
        mileage: "18,400 mi",
        exterior_color: "Midnight Blue",
        interior_color: "Grey Leather",
        number_of_owners: 2,
        registration_city: "Munich",
        insurance_validity: "Jul 2025",
        description: "The last of the air-cooled 911s. The 993 generation is widely regarded as the most beautiful and involving 911 ever built.",
        image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
        secondary_images: [],
        seller_name: "Trailblaze Classic",
        condition: "Used",
        availability_status: "Unavailable"
    },
    {
        name: "Ferrari F40",
        brand: "Ferrari",
        model_year: 1987,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 4500,
        range: "10 kmpl",
        body_type: "Coupe",
        mileage: "12,100 mi",
        exterior_color: "Rosso Corsa",
        interior_color: "Red Racing Seats",
        number_of_owners: 2,
        registration_city: "Milan",
        insurance_validity: "Dec 2026",
        description: "The legend himself. twin-turbo V8, no driver aids, pure adrenaline. The F40 is the ultimate analogue driving machine.",
        image_url: "https://cdn.ferrari.com/cms/network/media/img/resize/5de7923a91756c07f10b1720-ferrari-f40-1987-intro-share?width=1080",
        secondary_images: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhKwVWo4rWV5Bw8XZY8th8O02yRaphLHSPlA&s",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2iUOCl-2pmA2XJ809kzwj9k9axCN7oPSDBQ&s"
        ],
        seller_name: "Trailblaze Elite Collections",
        condition: "Used",
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
        image_url: "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=1200",
        secondary_images: [],
        seller_name: "TrailblazeAuto AMG Center",
        availability_status: "Unavailable",
        discount_percentage: 0
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
        image_url: "https://hips.hearstapps.com/hmg-prod/images/2022-alfa-romeo-giulia-quadrifoglio-mmp-1-1633103418.jpg",
        secondary_images: [],
        seller_name: "TrailblazeAuto Classics",
        condition: "Used",
        availability_status: "Available",
        discount_percentage: 0
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
        image_url: "https://images.unsplash.com/photo-1736746419802-b608fa1ea070?q=80&w=1200&auto=format&fit=crop",
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
        number_of_owners: 2,
        registration_city: "Seattle",
        insurance_validity: "Aug 2025",
        description: "The Porsche Panamera 4S blends supercar performance with the comfort of a luxury saloon. Powered by a 2.9L twin-turbo V6 producing 444 hp, it sprints 0-60 in 3.9 seconds.",
        image_url: "https://images.unsplash.com/photo-1547744152-14d985cb937f?q=80&w=1200&auto=format&fit=crop",
        secondary_images: [],
        seller_name: "TrailblazeAuto Premium",
        condition: "Used",
        availability_status: "Available"
    },
    {
        name: "R8 V10 Performance",
        brand: "Audi",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 135000,
        range: "15 kmpl",
        body_type: "Coupe",
        mileage: "4,500 mi",
        exterior_color: "Suzuka Grey",
        interior_color: "Black",
        number_of_owners: 1,
        registration_city: "Las Vegas",
        insurance_validity: "Oct 2025",
        description: "The Audi R8 V10 is a supercar that perfectly balances track-ready performance with everyday livability. It features a naturally aspirated 5.2L V10 engine that produces an unforgettable soundtrack.",
        image_url: "https://images.unsplash.com/photo-1597007066704-67bf2068d5b2?q=80&w=1200&auto=format&fit=crop",
        secondary_images: [],
        seller_name: "TrailblazeAuto Elite",
        availability_status: "Available"
    },
    {
        name: "Corvette Z06",
        brand: "Chevrolet",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 95000,
        range: "16 kmpl",
        body_type: "Coupe",
        mileage: "2,100 mi",
        exterior_color: "Torch Red",
        interior_color: "Adrenaline Red",
        number_of_owners: 1,
        registration_city: "Houston",
        insurance_validity: "Feb 2026",
        description: "The Chevrolet Corvette Z06 brings a flat-plane crank V8 howling to an 8600-rpm redline, delivering 670 horsepower and exotic-car performance at a fraction of the price.",
        image_url: "https://hips.hearstapps.com/hmg-prod/images/2023-lightning-lap-chevrolet-corvette-z06-mu-101-1675450314.jpg?crop=0.667xw:0.563xh;0.0641xw,0.313xh&resize=2048:*",
        secondary_images: [],
        seller_name: "TrailblazeAuto Premium",
        availability_status: "Available",
        discount_percentage: 40
    },
    {
        name: "Mustang Mach-E GT",
        brand: "Ford",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Electric",
        seating_capacity: 5,
        price_per_day: 65000,
        range: "270 mi",
        body_type: "SUV",
        mileage: "8,500 mi",
        exterior_color: "Grabber Blue",
        interior_color: "Black Onyx",
        number_of_owners: 1,
        registration_city: "Austin",
        insurance_validity: "Sep 2025",
        description: "The Ford Mustang Mach-E GT brings the iconic pony car into the electric era. With 480 horsepower and instantaneous torque, it launches from 0-60 in 3.5 seconds.",
        image_url: "https://i0.wp.com/driveman.ca/wp-content/uploads/2023/09/IMG_3573.jpg?w=1200&ssl=1",
        secondary_images: [],
        seller_name: "TrailblazeAuto EV Center",
        availability_status: "Available",
        discount_percentage: 15
    },
    {
        name: "LC 500",
        brand: "Lexus",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 115000,
        range: "14 kmpl",
        body_type: "Coupe",
        mileage: "1,200 mi",
        exterior_color: "Infrared",
        interior_color: "Toasted Caramel",
        number_of_owners: 1,
        registration_city: "Los Angeles",
        insurance_validity: "Jan 2026",
        description: "The Lexus LC 500 is a masterpiece of design and engineering. It features a naturally aspirated 5.0L V8 and an impeccably crafted interior that rivals the finest grand tourers.",
        image_url: "https://images.unsplash.com/photo-1577496550006-f24a50e9d50c?q=80&w=1200&auto=format&fit=crop",
        secondary_images: [],
        seller_name: "TrailblazeAuto Premium",
        availability_status: "Available"
    },
    {
        name: "911 Carrera (993)",
        brand: "Porsche",
        model_year: 1995,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 125000,
        range: "12 kmpl",
        body_type: "Coupe",
        mileage: "42,000 mi",
        exterior_color: "Polar Silver",
        interior_color: "Midnight Blue",
        number_of_owners: 3,
        registration_city: "Portland",
        insurance_validity: "Jul 2025",
        description: "The 993 is the last of the air-cooled 911s, representing the end of an era. This Carrera is in pristine condition, offering the pure, mechanical driving experience that modern cars can't replicate.",
        image_url: "https://www.clinkardcars.co.uk/blobs/Images/Stock/490/5b750272-4020-4792-981d-315b6829220f.jpg?width=800&height=533",
        secondary_images: [],
        seller_name: "TrailblazeAuto Classics",
        condition: "Used",
        availability_status: "Available"
    },
    {
        name: "M5 (E39)",
        brand: "BMW",
        model_year: 2001,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 68000,
        range: "10 kmpl",
        body_type: "Sedan",
        mileage: "65,000 mi",
        exterior_color: "Le Mans Blue",
        interior_color: "Black/Blue Leather",
        number_of_owners: 2,
        registration_city: "Atlanta",
        insurance_validity: "May 2025",
        description: "Widely considered the greatest sports sedan ever made. The E39 M5 features a 4.9L V8 and a 6-speed manual, delivering 400hp in a package that looks as good today as it did 20 years ago.",
        image_url: "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?q=80&w=1200&auto=format&fit=crop",
        secondary_images: [],
        seller_name: "TrailblazeAuto Elite",
        condition: "Used",
        availability_status: "Available"
    },
    {
        name: "560SEC",
        brand: "Mercedes-Benz",
        model_year: 1991,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 55000,
        range: "8 kmpl",
        body_type: "Coupe",
        mileage: "88,000 mi",
        exterior_color: "Blue-Black Metallic",
        interior_color: "Grey Leather",
        number_of_owners: 4,
        registration_city: "Palm Beach",
        insurance_validity: "Oct 2025",
        description: "The W126 560SEC was the ultimate expression of Mercedes engineering in the early 90s. This flagship coupe offers vault-like build quality and effortless V8 power.",
        image_url: "https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=1200",
        secondary_images: [],
        seller_name: "TrailblazeAuto Classics",
        condition: "Used",
        availability_status: "Available"
    },
    {
        name: "Skyline GT-R R34",
        brand: "Nissan",
        model_year: 2002,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 220000,
        range: "9 kmpl",
        body_type: "Coupe",
        mileage: "24,000 mi",
        exterior_color: "Bayside Blue",
        interior_color: "Grey Cloth",
        number_of_owners: 2,
        registration_city: "San Francisco",
        insurance_validity: "Dec 2026",
        description: "A JDM legend. This R34 V-Spec II is one of the most desirable cars in the world. Powered by the legendary RB26DETT, it features advanced ATTESA E-TS 4WD.",
        image_url: "https://static0.hotcarsimages.com/wordpress/wp-content/uploads/2022/06/Motorex-R34-V-Spec-II-Front-Quarter-View.jpg?q=50&fit=crop&w=825&dpr=1.5",
        secondary_images: [],
        seller_name: "TrailblazeAuto Elite",
        condition: "Used",
        availability_status: "Available"
    },
    {
        name: "NSX",
        brand: "Honda",
        model_year: 1989,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 95000,
        range: "11 kmpl",
        body_type: "Coupe",
        mileage: "31,000 mi",
        exterior_color: "Formula Red",
        interior_color: "Black Leather",
        number_of_owners: 2,
        registration_city: "Austin",
        insurance_validity: "Apr 2025",
        description: "Developed with input from Ayrton Senna, the original NSX proved that supercars could be daily drivable. This first-year model is a low-mileage time capsule.",
        image_url: "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=1200",
        secondary_images: [],
        seller_name: "TrailblazeAuto Classics",
        condition: "Used",
        availability_status: "Available"
    },
    {
        name: "Supra Turbo MK4",
        brand: "Toyota",
        model_year: 1994,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 185000,
        range: "10 kmpl",
        body_type: "Coupe",
        mileage: "31,000 mi",
        exterior_color: "Renaissance Red",
        interior_color: "Black Leather",
        number_of_owners: 2,
        registration_city: "Los Angeles",
        insurance_validity: "Aug 2025",
        description: "The Holy Grail of JDM. This MK4 Supra features the legendary 2JZ-GTE engine and a 6-speed Getrag manual. Unmodified and in collector condition.",
        image_url: "https://media.carsandbids.com/cdn-cgi/image/width=2080,quality=70/da4b9237bacccdf19c0760cab7aec4a8359010b0/photos/rkV8nJAg-NHnlFaxpeG-(edit)2-2-YINeQ9twPr.jpg?t=172806934559",
        secondary_images: [],
        seller_name: "TrailblazeAuto Elite",
        condition: "Used",
        availability_status: "Available"
    },
    {
        name: "RX-7 Spirit R",
        brand: "Mazda",
        model_year: 1997,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 110000,
        range: "8 kmpl",
        body_type: "Coupe",
        mileage: "18,500 mi",
        exterior_color: "Titanium Grey",
        interior_color: "Red Recaro",
        number_of_owners: 1,
        registration_city: "Tokyo",
        insurance_validity: "Jan 2026",
        description: "The pinnacle of rotary performance. The FD RX-7 Spirit R is the most refined and capable version of Mazda's masterpiece.",
        image_url: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=1200&auto=format&fit=crop",
        secondary_images: [],
        seller_name: "TrailblazeAuto Classics",
        availability_status: "Available"
    },
    {
        name: "Quattro",
        brand: "Audi",
        model_year: 1983,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 75000,
        range: "11 kmpl",
        body_type: "Coupe",
        mileage: "55,000 mi",
        exterior_color: "Mars Red",
        interior_color: "Checkered Cloth",
        number_of_owners: 3,
        registration_city: "Munich",
        insurance_validity: "Sep 2025",
        description: "The car that changed rallying forever. The original Audi Quattro (Ur-Quattro) features iconic flared wheel arches and the legendary 5-cylinder turbo.",
        image_url: "https://cdn.dealeraccelerate.com/throttle/1/371/12209/1920x1440/1983-audi-ur-quattro",
        secondary_images: [],
        seller_name: "TrailblazeAuto Classics",
        condition: "Used",
        availability_status: "Available"
    },
    {
        name: "Delta HF Integrale",
        brand: "Lancia",
        model_year: 1992,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 5,
        price_per_day: 145000,
        range: "9 kmpl",
        body_type: "Hatchback",
        mileage: "22,000 mi",
        exterior_color: "Martini Racing",
        interior_color: "Grey Alcantara",
        number_of_owners: 2,
        registration_city: "Milan",
        insurance_validity: "Dec 2025",
        description: "A rally icon for the road. The Evoluzione II represents the final and most sophisticated version of the legendary Delta Integrale.",
        image_url: "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=1200",
        secondary_images: [],
        seller_name: "TrailblazeAuto Elite",
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
        console.log(`Public car sync complete. Created: ${created}, Updated: ${updated}`);

        // Seed Sale History for some cars task-5
        console.log("Seeding historical transaction data...");
        const allCars = await Car.findAll();
        for (const car of allCars) {
            const existingHistory = await SaleHistory.findOne({ where: { car_id: car._id } });
            if (!existingHistory) {
                const currentYear = new Date().getFullYear();
                const age = Math.max(1, currentYear - car.model_year);
                const records = [];
                const isClassic = car.model_year < 2010;

                // Intelligent base valuation based on price type (Rental vs Sale)
                // If price < 15,000, it's likely a rental rate; if higher, it's the actual asset value.
                const isRentalRate = car.price_per_day < 15000;
                const baseValue = isRentalRate ? car.price_per_day * (isClassic ? 250 : 100) : car.price_per_day;

                // 1. Initial Sale
                records.push({
                    car_id: car._id,
                    sale_date: new Date(car.model_year, 0, 1),
                    price: Math.floor(baseValue * (isClassic ? 0.4 : 1.1)), // Classics were cheaper then
                    seller_name: `${car.brand} Authorized Dealer`,
                    buyer_name: "Original Collector",
                    sale_status: "Sold"
                });

                // 2. Intermediate Sales
                if (car.number_of_owners > 1) {
                    for (let i = 1; i < car.number_of_owners; i++) {
                        const yearStep = Math.floor(age / car.number_of_owners);
                        const progress = i / car.number_of_owners;
                        // Classics appreciate, moderns depreciate
                        const priceFactor = isClassic ? (0.4 + (progress * 0.6)) : (1.1 - (progress * 0.4));

                        records.push({
                            car_id: car._id,
                            sale_date: new Date(car.model_year + (yearStep * i), 5, 20),
                            price: Math.floor(baseValue * priceFactor),
                            seller_name: i === 1 ? "Original Collector" : `Owner ${i}`,
                            buyer_name: i === car.number_of_owners - 1 ? "TrailblazeAuto Collections" : `Owner ${i + 1}`,
                            sale_status: "Sold"
                        });
                    }
                }

                if (records.length > 0) {
                    await SaleHistory.bulkCreate(records);
                }
            }
        }
        console.log("Historical transaction data seeded!");

        // Seed Additional Admins and Users (Append)
        const public_users = [
            { full_name: "System Admin", email: "admin@test.com", password: "password123", role: "admin" },
            // Additional Admins
            { full_name: "Public Admin 1", email: "admin1@pub.com", password: "pub123", role: "admin" },
            { full_name: "Public Admin 2", email: "admin2@pub.com", password: "pub123", role: "admin" },
            { full_name: "Public Admin 3", email: "admin3@pub.com", password: "pub123", role: "admin" },
            { full_name: "Public Admin 4", email: "admin4@pub.com", password: "pub123", role: "admin" },
            { full_name: "Public Admin 5", email: "admin5@pub.com", password: "pub123", role: "admin" },
        ];

        console.log("Seeding public auxiliary accounts...");
        for (const userData of public_users) {
            await Admin.findOrCreate({
                where: { email: userData.email },
                defaults: userData,
                individualHooks: true
            });
        }
        console.log("Public auxiliary accounts seeded!");

        process.exit(0);
    } catch (err) {
        console.error("Error seeding public data:", err);
        process.exit(1);
    }
};

seedPublic();
