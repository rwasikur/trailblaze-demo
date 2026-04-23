const { connectDB } = require('../config/db');
const Car = require('../models/Car');
const Admin = require('../models/Admin');
const SaleHistory = require('../models/SaleHistory');

const private_cars = [

    {
        name: "Maybach S680 Private",
        brand: "Mercedes-Maybach",

        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 4,

        price_per_day: 1800,

        range: "444 mi",
        body_type: "Sedan",
        mileage: "12 mpg city / 21 mpg highway",

        exterior_color: "Two-tone Nautical Blue",
        interior_color: "Crystal White",

        number_of_owners: 1,
        registration_city: "Geneva",
        insurance_validity: "Dec 2025",

        description: "The pinnacle of Mercedes luxury, reserved for private fleet executive travel.",

        // Your provided working image link
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Mercedes-Benz/Maybach-S-Class/10866/1763536299202/front-left-side-47.jpg",

        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Mercedes-Benz/Maybach-S-Class/10866/1690453886358/front-view-118.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Mercedes-Benz/Maybach-S-Class/10866/1690453886358/rear-right-side-48.jpg"

        ],

        availability_status: "Available",
        seller_name: "Trailblaze Private Reserve"
    }
    ,
    {
        name: "911 Sport Classic Private",
        brand: "Porsche",
        model_year: 2023,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 2800,
        range: "16 kmpl",
        body_type: "Coupe",
        mileage: "1,200 mi",
        exterior_color: "Sport Grey Metallic",
        interior_color: "Heritage Design Black/Cognac",
        number_of_owners: 1,
        registration_city: "Zurich",
        insurance_validity: "Aug 2025",
        description: "Limited edition 911 with a ducktail spoiler and manual gearbox, exclusive to private members.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Porsche/911/11757/1762933836560/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Porsche/911/11757/1762933836560/rear-left-view-121.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Porsche/911/11757/1762933836560/rear-view-119.jpg",

        ],
        availability_status: "Available",
        condition: "Used",
        seller_name: "Trailblaze Private Reserve"
    }
    ,
    {
        name: "Model S Plaid Private",
        brand: "Tesla",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Electric",
        seating_capacity: 5,
        price_per_day: 18000,
        range: "396 mi",
        body_type: "Sedan",
        mileage: "2,100 mi",
        exterior_color: "Ultra Red",
        interior_color: "White",
        number_of_owners: 1,
        registration_city: "Palo Alto",
        insurance_validity: "Jan 2026",
        description: "Tesla Model S Plaid reserved for private fleet — tri-motor performance with full autopilot.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Tesla/Model-S/5252/1752499273852/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Tesla/Model-S/5252/1611840999494/top-view-117.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Tesla/Model-S/5252/1611840999494/side-mirror-(glass)-92.jpg"
        ],
        availability_status: "Available",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "Range Rover Autobiography Private",
        brand: "Land Rover",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Diesel",
        seating_capacity: 5,
        price_per_day: 20000,
        range: "14 kmpl",
        body_type: "SUV",
        mileage: "12,000 mi",
        exterior_color: "Eiger Grey",
        interior_color: "Caraway Leather",
        number_of_owners: 1,
        registration_city: "Dubai",
        insurance_validity: "Oct 2025",
        description: "Range Rover Autobiography in private fleet — executive SUV with premium cabin.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Land-Rover/Range-Rover/8743/1769596936159/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Land-Rover/Range-Rover/12533/1775802721227/side-view-(left)-90.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Land-Rover/Range-Rover/11540/1719037924320/exterior-image-165.jpg"
        ],
        availability_status: "Available",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "Continental GT Private",
        brand: "Bentley",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 35000,
        range: "12 kmpl",
        body_type: "Coupe",
        mileage: "800 mi",
        exterior_color: "Viridian Green",
        interior_color: "Linen/Cumbrian Green",
        number_of_owners: 1,
        registration_city: "Monaco",
        insurance_validity: "May 2026",
        description: "Bentley Continental GT exclusively for private members — handcrafted luxury grand tourer.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Bentley/Continental/10473/1769060132454/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Bentley/Continental/7771/1676965640042/rear-right-side-48.jpg",
            "https://stimg.cardekho.com/images/carinteriorimages/930x620/Bentley/Continental/7771/1676965589168/dashboard-59.jpg",
            "https://stimg.cardekho.com/images/carinteriorimages/930x620/Bentley/Continental/7771/1676965589168/gear-shifter-87.jpg"
        ],
        availability_status: "Available",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "Urus Private",
        brand: "Lamborghini",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 30000,
        range: "10 kmpl",
        body_type: "SUV",
        mileage: "6,700 mi",
        exterior_color: "Giallo Auge",
        interior_color: "Nero Ade",
        number_of_owners: 1,
        registration_city: "Sant'Agata",
        insurance_validity: "Jul 2025",
        description: "Lamborghini Urus restricted to private fleet — super SUV with 650hp twin-turbo V8.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Lamborghini/Urus/10636/1769059431316/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Lamborghini/Urus/10635/1724844423793/rear-left-view-121.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Lamborghini/Urus/10635/1724844423793/rear-view-119.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Lamborghini/Urus/10635/1724844423793/rear-right-side-48.jpg"
        ],
        availability_status: "Available",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "DBS Superleggera Private",
        brand: "Aston Martin",
        model_year: 2023,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 4,
        price_per_day: 40000,
        range: "9 kmpl",
        body_type: "Coupe",
        mileage: "1,500 mi",
        exterior_color: "Hyper Red",
        interior_color: "Phantom Grey",
        number_of_owners: 1,
        registration_city: "Gaydon",
        insurance_validity: "Feb 2026",
        description: "Aston Martin DBS restricted to private fleet — gorgeous flagship GT with a twin-turbo v12.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Aston-Martin/Aston-Martin-DBS-Superleggera/6904/1556271600796/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Aston-Martin/Aston-Martin-DBS-Superleggera/6904/1556269949670/front-view-118.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Aston-Martin/Aston-Martin-DBS-Superleggera/6904/1556269949670/rear-left-view-121.jpg"
        ],
        availability_status: "Available",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "F8 Tributo Private",
        brand: "Ferrari",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 45000,
        range: "11 kmpl",
        body_type: "Coupe",
        mileage: "450 mi",
        exterior_color: "Rosso Corsa",
        interior_color: "Nero",
        number_of_owners: 1,
        registration_city: "Maranello",
        insurance_validity: "Nov 2026",
        description: "Ferrari F8 Tributo for private members only — an homage to the most powerful V8 in Ferrari history.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Ferrari/F8-Tributo/7945/1769146100207/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Ferrari/F8-Tributo/7945/1598599471404/front-view-118.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Ferrari/F8-Tributo/7945/1598599471404/fornt-left-view-89.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Ferrari/F8-Tributo/7945/1598599471404/rear-view-119.jpg"
        ],
        availability_status: "Available",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "Chiron Private",
        brand: "Bugatti",
        model_year: 2022,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 150000,
        range: "8 kmpl",
        body_type: "Coupe",
        mileage: "230 mi",
        exterior_color: "Noire",
        interior_color: "Gris",
        number_of_owners: 1,
        registration_city: "Molsheim",
        insurance_validity: "Apr 2025",
        description: "Bugatti Chiron reserved for our most exclusive private members. Features an 8.0L quad-turbocharged W16 engine.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Bugatti/Chiron/8451/1633582433934/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Bugatti/Chiron/8451/1633582433934/front-view-118.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Bugatti/Chiron/8451/1633582433934/side-view-(left)-90.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Bugatti/Chiron/8451/1633582433934/exterior-image-164.jpg"
        ],
        availability_status: "Unavailable",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "P1 Private",
        brand: "McLaren",
        model_year: 2015,
        transmission: "Automatic",
        fuel_type: "Hybrid",
        seating_capacity: 2,
        price_per_day: 120000,
        range: "13 kmpl",
        body_type: "Coupe",
        mileage: "3,800 mi",
        exterior_color: "Volcano Orange",
        interior_color: "Carbon Black",
        number_of_owners: 2,
        registration_city: "London",
        insurance_validity: "Sep 2025",
        description: "McLaren P1 for private fleet. A legendary hybrid hypercar combining F1 technology with striking aerodynamics.",
        image_url: "https://stimg2.cardekho.com/images/carNewsEditorImages/15257/0.jpg",
        secondary_images: [
            "https://stimg2.cardekho.com/images/carNewsEditorImages/15257/1.jpg",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK5Fa5wPFLYdpHm0_vt04mJmgEHBKAnBCYkA&s"
        ],
        availability_status: "Available",
        condition: "Used",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "F40 Private",
        brand: "Ferrari",
        model_year: 1987,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 250000,
        range: "6 kmpl",
        body_type: "Coupe",
        mileage: "8,900 mi",
        exterior_color: "Rosso Corsa",
        interior_color: "Red Cloth",
        number_of_owners: 2,
        registration_city: "Rome",
        insurance_validity: "Jun 2026",
        description: "The Ferrari F40 is the ultimate analogue supercar. Built to celebrate Ferrari's 40th anniversary, it was the last car personally approved by Enzo Ferrari.",
        image_url: "https://cdn.ferrari.com/cms/network/media/img/resize/5de7923a91756c07f10b1720-ferrari-f40-1987-intro-share?width=1080",
        secondary_images: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhKwVWo4rWV5Bw8XZY8th8O02yRaphLHSPlA&s",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2iUOCl-2pmA2XJ809kzwj9k9axCN7oPSDBQ&s"
        ],
        availability_status: "Available",
        condition: "Used",
        seller_name: "Trailblaze Private Reserve"
    },
    {
        name: "F1 XP5 Private",
        brand: "McLaren",
        model_year: 1993,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 3,
        price_per_day: 12000,
        range: "8 kmpl",
        body_type: "Coupe",
        mileage: "4,500 mi",
        exterior_color: "Dark Silver",
        interior_color: "Red/Black Leather",
        number_of_owners: 1,
        registration_city: "Woking",
        insurance_validity: "Nov 2025",
        description: "One of the original experimental prototypes of the McLaren F1, now held in our private reserve.",
        image_url: "https://cdn.forza.net/strapi-uploads/assets/Forza_Motorsport_MCL_F1_93_Grand_Oak_Car_History_01_16x9_WM_20a3e864c5.jpg",
        secondary_images: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdeIx3mm3elUvZtZBnohR5OvF-tURZ5gAYFb4o9Dsnvw&s",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbcOSYHTUF2liurbWKVF16xUIHkLtCjNz4wg&s"
        ],
        availability_status: "Unavailable",
        condition: "Used",
        seller_name: "Trailblaze Private High-End"
    },
    {
        name: "Sierra",
        brand: "Tata",
        model_year: 1988,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 180000,
        range: "5 kmpl",
        body_type: "Coupe",
        mileage: "15,400 mi",
        exterior_color: "Bianco Polo",
        interior_color: "White Leather",
        number_of_owners: 3,
        registration_city: "Zürich",
        insurance_validity: "Mar 2026",
        description: "The Tata sierra is the quintessential poster car. This 'Quattrovalvole' model represents the peak of Countach performance.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Tata/Sierra/12271/1765181428462/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Tata/Sierra/12271/1765181428462/side-view-(left)-90.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Tata/Sierra/12271/1765181428462/rear-right-side-48.jpg"
        ],
        availability_status: "Available",
        condition: "Used",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "Carrera GT Private",
        brand: "Porsche",
        model_year: 2005,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 210000,
        range: "12 kmpl",
        body_type: "Coupe",
        mileage: "2,100 mi",
        exterior_color: "GT Silver",
        interior_color: "Terracotta",
        number_of_owners: 2,
        registration_city: "Leipzig",
        insurance_validity: "Jan 2026",
        description: "The Porsche Carrera GT is one of the last great analogue supercars. Features a race-derived V10 that produces one of the best sounds in automotive history.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Porsche/Porsche-Carrera-GT/785/1562843571849/front-left-side-47.jpg",
        secondary_images: [
            "https://static0.hotcarsimages.com/wordpress/wp-content/uploads/2021/11/Yellow-2005-Porsche-Carrera-GT-Supercar.jpg?w=1200&h=628&fit=crop",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3yq7rc7vtaZB7OLANt3kgkwBY2-d5mjPg1g&s"
        ],
        availability_status: "Available",
        condition: "Used",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "Enzo Private",
        brand: "Ferrari",
        model_year: 2002,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 350000,
        range: "8 kmpl",
        body_type: "Coupe",
        mileage: "1,100 mi",
        exterior_color: "Rosso Scuderia",
        interior_color: "Cuoio Leather",
        number_of_owners: 2,
        registration_city: "Modena",
        insurance_validity: "Feb 2026",
        description: "Named after the founder, the Ferrari Enzo brought f1 technology to the road. This V12 masterpiece is a cornerstone of any serious private collection.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Ferrari/Ferrari-Enzo/1658/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/car-images/large/Ferrari/Ferrari-Enzo/ferrari-enzo4.jpg",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpfmXZS8FWsGWn0Ul3hK22kRe-z3qDRPMXrQ&s"
        ],
        availability_status: "Available",
        condition: "Used",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "EB110 SS Private",
        brand: "Bugatti",
        model_year: 1992,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 380000,
        range: "7 kmpl",
        body_type: "Coupe",
        mileage: "1,800 mi",
        exterior_color: "Bugatti Blue",
        interior_color: "Grey",
        number_of_owners: 1,
        registration_city: "Campogalliano",
        insurance_validity: "Dec 2025",
        description: "The Bugatti EB110 Super Sport is a quad-turbocharged V12 masterpiece from the 90s, featuring active aerodynamics and four-wheel drive.",
        image_url: "https://cdn.dealeraccelerate.com/bagauction/25/4664/204195/790x1024/1992-bugatti-eb110-gt",
        secondary_images: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ1X013F-9Qpte6Fd7LdibE6Xezk3CS_C_HA&s",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjrDXFfsG1EDhOYW8sEMGvOE3Ux4YvMlGKmA&s",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3bXZzWoXawx18KdhS2Hss3fxVVg8WWjKOSg&s"
        ],
        availability_status: "Available",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "F Pace",
        brand: "Jaguar",
        model_year: 1992,
        transmission: "Manual",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 320000,
        range: "6 kmpl",
        body_type: "Coupe",
        mileage: "2,500 mi",
        exterior_color: "Silver",
        interior_color: "Black",
        number_of_owners: 2,
        registration_city: "Coventry",
        insurance_validity: "Aug 2025",
        description: "The Jaguar F-Pace  was briefly the world's fastest production car. Its twin-turbo V6 and low-slung silhouette make it a private fleet essential.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Jaguar/F-Pace/10644/1755774688332/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Jaguar/F-Pace/10644/1750059519742/exterior-image-165.jpg",
            "https://stimg.cardekho.com/images/carinteriorimages/930x620/Jaguar/F-Pace/10644/1690011966066/door-view-of-driver-seat-51.jpg"

        ],
        availability_status: "Unavailable",
        condition: "Used",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "CLK GTR Private",
        brand: "Mercedes-Benz",
        model_year: 1998,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 650000,
        range: "4 kmpl",
        body_type: "Coupe",
        mileage: "500 mi",
        exterior_color: "Silver Arrow",
        interior_color: "Checkered Alcantara",
        number_of_owners: 1,
        registration_city: "Affalterbach",
        insurance_validity: "Jul 2026",
        description: "A road-legal variant of the GT championship winner. The CLK GTR is a brutal, pure racing machine for the street.",
        image_url: "https://cars.bonhams.com/_next/image.jpg?url=https%3A%2F%2Fimg1.bonhams.com%2Fimage%3Fsrc%3DImages%2Flive%2F2015-05%2F14%2F9174285-1-1.jpeg&w=2400&q=75",
        secondary_images: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM5Q99yuTeY95RS0kF_CI1mvtjDMgMTKJLRQ&s",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGUWVSISofo8UU3F3PKINnZkJXNzj3N1-5KQ&s"
        ],
        availability_status: "Available",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "Senna Private",
        brand: "McLaren",
        model_year: 2019,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 180000,
        range: "12 kmpl",
        body_type: "Coupe",
        mileage: "1,100 mi",
        exterior_color: "Cyber Yellow",
        interior_color: "Black/Yellow Alcantara",
        number_of_owners: 1,
        registration_city: "Woking",
        insurance_validity: "Mar 2026",
        description: "The McLaren Senna is built for the track, but legal for the road. It represents the ultimate connection between car and driver.",
        image_url: "https://i.ndtvimg.com/i/2017-12/2019-mclaren-senna_827x510_51512909269.jpg",
        secondary_images: [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQRcsOrBytU3LDH9-BGfQ0CmX3aOdxB19jwg&s",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkO_CktUVyIXOyoYk5ZOPTpUpZ8k6ytJzh3g&s"
        ],
        availability_status: "Available",
        seller_name: "TrailblazeAuto Private Reserve"
    },
    {
        name: "Vantage",
        brand: "Aston Martin",
        model_year: 2024,
        transmission: "Automatic",
        fuel_type: "Petrol",
        seating_capacity: 2,
        price_per_day: 280000,
        range: "10 kmpl",
        body_type: "Coupe",
        mileage: "1,500 mi",
        exterior_color: "Skyfall Silver",
        interior_color: "Deep Black Leather",
        number_of_owners: 1,
        registration_city: "Gaydon",
        insurance_validity: "May 2025",
        description: "The Aston Martin Vantage is a limited-edition flagship with a handcrafted aluminum body and a 7.3L V12 engine.",
        image_url: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Aston-Martin/Vantage/11671/1769509518605/front-left-side-47.jpg",
        secondary_images: [
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Aston-Martin/Vantage/11671/1713933297665/side-view-(left)-90.jpg",
            "https://stimg.cardekho.com/images/carexteriorimages/930x620/Aston-Martin/Vantage/11671/1713933297665/window-line-158.jpg"
        ],
        availability_status: "Available",
        seller_name: "TrailblazeAuto Private Reserve"
    }
];

const seedPrivate = async () => {
    try {
        console.log("Running private database seeding (Postgres/Sequelize)...");
        await connectDB();

        // Sync and clear tables
        await Car.sync({ alter: true });
        await SaleHistory.sync({ alter: true });

        await SaleHistory.destroy({ where: {}, cascade: true });
        await Car.destroy({ where: {}, truncate: true, cascade: true });

        await Car.bulkCreate(private_cars);
        console.log("Private vehicle seed data loaded!");

        // Seed Sale History for private cars with distinct data
        console.log("Seeding private historical transaction data...");
        const allCars = await Car.findAll();
        for (const car of allCars) {
            const currentYear = new Date().getFullYear();
            const age = Math.max(1, currentYear - car.model_year);
            const records = [];
            const isMegaClass = car.price_per_day > 3000 || car.model_year < 2000;
            // Determine if the price_per_day is a rental rate or a full asset value
            const isRentalRate = car.price_per_day < 20000;
            const baseValue = isRentalRate ? car.price_per_day * (isMegaClass ? 700 : 250) : car.price_per_day;

            // 1. Initial Sale (Record-breaking Auction)
            records.push({
                car_id: car._id,
                sale_date: new Date(car.model_year, 0, 1),
                price: Math.floor(baseValue * (isMegaClass ? 0.3 : 1.1)),
                seller_name: "Sotheby's Private Sales",
                buyer_name: "Anonymous Mogul",
                sale_status: "Sold"
            });

            // 2. Intermediate Sales (Appreciation focus for Private fleet)
            if (car.number_of_owners > 1) {
                for (let i = 1; i < car.number_of_owners; i++) {
                    const yearStep = Math.floor(age / car.number_of_owners);
                    const progress = i / car.number_of_owners;
                    // Hypercars in private fleet almost always appreciate
                    const priceFactor = 0.3 + (progress * 1.2);

                    records.push({
                        car_id: car._id,
                        sale_date: new Date(car.model_year + (yearStep * i), 2, 14),
                        price: Math.floor(baseValue * priceFactor),
                        seller_name: i === 1 ? "Anonymous Mogul" : `Private Collector ${i}`,
                        buyer_name: i === car.number_of_owners - 1 ? "Trailblaze Private Stock" : `Private Collector ${i + 1}`,
                        sale_status: "Sold"
                    });
                }
            }

            if (records.length > 0) {
                await SaleHistory.bulkCreate(records);
            }
        }
        console.log("Private historical transaction data seeded!");

        // Seed Additional Admins and Users (Append)
        const private_users = [
            { full_name: "Private Admin", email: "admin@test.com", password: "password123", role: "admin" },
            // Additional Admins
            { full_name: "Private Admin 1", email: "admin1@pri.com", password: "pri123", role: "admin" },
            { full_name: "Private Admin 2", email: "admin2@pri.com", password: "pri123", role: "admin" },
            { full_name: "Private Admin 3", email: "admin3@pri.com", password: "pri123", role: "admin" },
            { full_name: "Private Admin 4", email: "admin4@pri.com", password: "pri123", role: "admin" },
            { full_name: "Private Admin 5", email: "admin5@pri.com", password: "pri123", role: "admin" },
        ];

        console.log("Seeding private auxiliary accounts...");
        for (const userData of private_users) {
            await Admin.findOrCreate({
                where: { email: userData.email },
                defaults: userData,
                individualHooks: true
            });
        }
        console.log("Private auxiliary accounts seeded!");

        process.exit(0);
    } catch (err) {
        console.error("Error seeding private data:", err);
        process.exit(1);
    }
};

seedPrivate();
