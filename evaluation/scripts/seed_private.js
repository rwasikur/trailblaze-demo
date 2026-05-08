const { connectDB } = require('../config/db');
const { Op } = require('sequelize');
const Car = require('../models/Car');
const Admin = require('../models/Admin');
const Booking = require('../models/Booking');

const private_cars = [
    {
        name: "Swift",
        brand: "Maruti Suzuki",
        model: "Swift",
        model_year: 2021,
        price: 4699,
        currency: "USD",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Manual",
        fuel_type: "Petrol",
        mileage: "23.2 kmpl",
        total_distance_covered: "25,000 km",
        body_type: "Hatchback",
        seating_capacity: 5,
        available_colors: ["Nexa Blue"],
        registration_number: "KA05CD1234",
        registration_city: "Bengaluru",
        registration_state: "Karnataka",
        registration_year: 2021,
        insurance_validity: "Dec 2024",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Peppy and fun to drive Swift. Single handedly driven, completely scratchless.",
        thumbnail_image: "https://i.pinimg.com/1200x/ac/27/ba/ac27badb68fb480babe95024691f348c.jpg",
        images: [
            "https://i.pinimg.com/736x/b5/97/d7/b597d7a4d80ee6fe2fde65cc260d9b41.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 5,
        views: 1200,
        range: "160",
        past_owners: [
            {
                sale_date: "2021-01-10",
                sale_price: 6599,
                seller_name: "Maruti Arena",
                buyer_name: "Rahul Verma"
            }
        ]
    },
    {
        name: "Baleno",
        brand: "Maruti Suzuki",
        model: "Baleno",
        model_year: 2022,
        price: 7850,
        currency: "USD",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "22.94 kmpl",
        total_distance_covered: "18,000 km",
        body_type: "Hatchback",
        seating_capacity: 5,
        available_colors: ["Autumn Orange"],
        registration_number: "DL03EF5678",
        registration_city: "New Delhi",
        registration_state: "Delhi",
        registration_year: 2022,
        insurance_validity: "Mar 2025",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Premium hatchback with heads up display and 360 camera. Very smooth AMT.",
        thumbnail_image: "https://i.pinimg.com/1200x/f2/8a/17/f28a17c88218764b51e689e7fb151d65.jpg",
        images: [
            "https://i.pinimg.com/1200x/f2/9e/fa/f29efae233fc29b401c8880860808cf0.jpg",
            "https://i.pinimg.com/1200x/6b/fe/26/6bfe267adf072e454626ce7a651d0d17.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 3,
        views: 950,
        range: "155",
        past_owners: [
            {
                sale_date: "2022-04-15",
                sale_price: 10299,
                seller_name: "Nexa Showroom",
                buyer_name: "Sunil Narang"
            }
        ]
    },
    {
        name: "Venue",
        brand: "Hyundai",
        model: "Venue",
        model_year: 2020,
        price: 8899,
        currency: "USD",
        condition: "Used",
        number_of_owners: 2,
        transmission: "Manual",
        fuel_type: "Petrol",
        mileage: "17.52 kmpl",
        total_distance_covered: "40,000 km",
        body_type: "SUV",
        seating_capacity: 5,
        available_colors: ["Typhoon Silver"],
        registration_number: "MH01GH9012",
        registration_city: "Mumbai",
        registration_state: "Maharashtra",
        registration_year: 2020,
        insurance_validity: "Sep 2024",
        insurance_type: "Third Party",
        rc_status: "Active",
        description: "Compact SUV with great features and connectivity options.",
        thumbnail_image: "https://i.pinimg.com/736x/43/26/d8/4326d8d1dc197f5965fae6cb512a7baa.jpg",
        images: [
            "https://i.pinimg.com/1200x/9f/66/58/9f6658e955a28940bbc85c8e0cc344fb.jpg",
            "https://i.pinimg.com/736x/f6/a2/f8/f6a2f81b280742bb9866fe280bc2db6d.jpg"
        ],
        availability_status: "Sold",
        discount_percentage: 0,
        views: 820,
        range: "165",
        past_owners: [
            {
                sale_date: "2020-02-20",
                sale_price: 10999,
                seller_name: "Hyundai Dealership",
                buyer_name: "Amit Desai"
            },
            {
                sale_date: "2022-10-10",
                sale_price: 9250,
                seller_name: "Amit Desai",
                buyer_name: "Rohan Kapoor"
            }
        ]
    },
    {
        name: "Altroz",
        brand: "Tata",
        model: "Altroz",
        model_year: 2021,
        price: 7150,
        currency: "USD",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Manual",
        fuel_type: "Diesel",
        mileage: "25.11 kmpl",
        total_distance_covered: "35,000 km",
        body_type: "Hatchback",
        seating_capacity: 5,
        available_colors: ["Metallic Red"],
        registration_number: "TN02KL3456",
        registration_city: "Chennai",
        registration_state: "Tamil Nadu",
        registration_year: 2021,
        insurance_validity: "Jan 2025",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "5 star safety rating premium hatchback with incredible diesel efficiency.",
        thumbnail_image: "https://i.pinimg.com/1200x/5f/1c/3d/5f1c3d39272088af0a4a3a7d3bc8ec99.jpg",
        images: [
            "https://i.pinimg.com/1200x/69/04/d2/6904d2c5a5405711094d869879117b42.jpg",
            "https://i.pinimg.com/1200x/1c/54/6f/1c546f90fef26442a6686d3b30edc4aa.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 10,
        views: 600,
        range: "170",
        past_owners: [
            {
                sale_date: "2021-08-05",
                sale_price: 9650,
                seller_name: "Tata Motors",
                buyer_name: "Karthik R"
            }
        ]
    },
    {
        name: "Harrier",
        brand: "Tata",
        model: "Harrier",
        model_year: 2022,
        price: 17299,
        currency: "USD",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Automatic",
        fuel_type: "Diesel",
        mileage: "14.6 kmpl",
        total_distance_covered: "20,000 km",
        body_type: "SUV",
        seating_capacity: 5,
        available_colors: ["Oberon Black"],
        registration_number: "TS07MN7890",
        registration_city: "Hyderabad",
        registration_state: "Telangana",
        registration_year: 2022,
        insurance_validity: "May 2025",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Bold and beautiful Tata Harrier with panoramic sunroof and Kryotec engine.",
        thumbnail_image: "https://i.pinimg.com/1200x/44/16/17/4416176ef8e78724def40f2f1de8cf7f.jpg",
        images: [
            "https://i.pinimg.com/736x/63/24/4a/63244ad1b999fff0e70a7062596b81fd.jpg"
        ],
        availability_status: "Sold",
        discount_percentage: 5,
        views: 2100,
        range: "185",
        past_owners: [
            {
                sale_date: "2022-06-12",
                sale_price: 23099,
                seller_name: "Tata Dealership",
                buyer_name: "Srinivas Rao"
            }
        ]
    },
    {
        name: "Scorpio-N",
        brand: "Mahindra",
        model: "Scorpio",
        model_year: 2023,
        price: 20450,
        currency: "USD",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Automatic",
        fuel_type: "Diesel",
        mileage: "14.0 kmpl",
        total_distance_covered: "12,000 km",
        body_type: "SUV",
        seating_capacity: 7,
        available_colors: ["White"],
        registration_number: "UP14OP1234",
        registration_city: "Ghaziabad",
        registration_state: "Uttar Pradesh",
        registration_year: 2023,
        insurance_validity: "Jul 2025",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "The Big Daddy of SUVs. Mahindra Scorpio-N Z8L Diesel AT.",
        thumbnail_image: "https://i.pinimg.com/736x/22/00/ee/2200ee13a0a6bbbe73876bb7ea92b708.jpg",
        images: [
            "https://i.pinimg.com/736x/df/76/26/df7626dcda177e8f0b8e3ffa4107bcd6.jpg",
            "https://i.pinimg.com/736x/40/58/f3/4058f38fa3aad2572b03996bab2f2e15.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 2,
        views: 3500,
        range: "190",
        past_owners: [
            {
                sale_date: "2023-01-25",
                sale_price: 24650,
                seller_name: "Mahindra Showroom",
                buyer_name: "Anil Sharma"
            }
        ]
    },
    {
        name: "Carens",
        brand: "Kia",
        model: "Carens",
        model_year: 2022,
        price: 15199,
        currency: "USD",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "16.5 kmpl",
        total_distance_covered: "15,000 km",
        body_type: "MUV",
        seating_capacity: 7,
        available_colors: ["Imperial Blue"],
        registration_number: "GJ01QR5678",
        registration_city: "Ahmedabad",
        registration_state: "Gujarat",
        registration_year: 2022,
        insurance_validity: "Aug 2025",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Spacious 7 seater with amazing ride comfort and features.",
        thumbnail_image: "https://i.pinimg.com/1200x/1e/b4/0a/1eb40a237ecf39c3be47ce79dca23556.jpg",
        images: [
            "https://i.pinimg.com/1200x/c8/15/d1/c815d1e544b22536e4b96e08e4fdc694.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 8,
        views: 1100,
        range: "180",
        past_owners: [
            {
                sale_date: "2022-09-18",
                sale_price: 19399,
                seller_name: "Kia Dealership",
                buyer_name: "Vikram Patel"
            }
        ]
    },
    {
        name: "Kiger",
        brand: "Renault",
        model: "Kiger",
        model_year: 2021,
        price: 6799,
        currency: "USD",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "19.03 kmpl",
        total_distance_covered: "22,000 km",
        body_type: "SUV",
        seating_capacity: 5,
        available_colors: ["White"],
        registration_number: "KL07ST9012",
        registration_city: "Ernakulam",
        registration_state: "Kerala",
        registration_year: 2021,
        insurance_validity: "Feb 2025",
        insurance_type: "Third Party",
        rc_status: "Active",
        description: "Stunning sub-compact SUV with good ground clearance.",
        thumbnail_image: "https://i.pinimg.com/1200x/20/92/f3/2092f304b5bf8def650e4d672f2c103c.jpg",
        images: [
            "https://i.pinimg.com/1200x/7c/d5/f4/7cd5f42a35667daa129bb9d734e562ca.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 12,
        views: 750,
        range: "160",
        past_owners: [
            {
                sale_date: "2021-11-30",
                sale_price: 8899,
                seller_name: "Renault Dealer",
                buyer_name: "Joseph Matthew"
            }
        ]
    },
    {
        name: "Magnite",
        brand: "Nissan",
        model: "Magnite",
        model_year: 2022,
        price: 7550,
        currency: "USD",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Manual",
        fuel_type: "Petrol",
        mileage: "20.0 kmpl",
        total_distance_covered: "16,000 km",
        body_type: "SUV",
        seating_capacity: 5,
        available_colors: ["Flare Garnet Red"],
        registration_number: "RJ14UV3456",
        registration_city: "Jaipur",
        registration_state: "Rajasthan",
        registration_year: 2022,
        insurance_validity: "Oct 2024",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Value for money SUV with striking looks.",
        thumbnail_image: "https://i.pinimg.com/736x/6f/e2/08/6fe208105e9ef923380d4707e0693a21.jpg",
        images: [],
        availability_status: "Sold",
        discount_percentage: 5,
        views: 680,
        range: "165",
        past_owners: [
            {
                sale_date: "2022-03-05",
                sale_price: 9450,
                seller_name: "Nissan Showroom",
                buyer_name: "Rajendra Singh"
            }
        ]
    },
    {
        name: "Amaze",
        brand: "Honda",
        model: "Amaze",
        model_year: 2020,
        price: 6499,
        currency: "USD",
        condition: "Used",
        number_of_owners: 2,
        transmission: "Manual",
        fuel_type: "Petrol",
        mileage: "18.6 kmpl",
        total_distance_covered: "45,000 km",
        body_type: "Sedan",
        seating_capacity: 5,
        available_colors: ["White"],
        registration_number: "WB02WX7890",
        registration_city: "Kolkata",
        registration_state: "West Bengal",
        registration_year: 2020,
        insurance_validity: "Nov 2024",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Reliable and spacious compact sedan. Excellent boot space.",
        thumbnail_image: "https://i.pinimg.com/736x/c4/24/01/c42401a7a7c204cb9bb7fafe9041d05b.jpg",
        images: [
            "https://i.pinimg.com/736x/56/9c/e9/569ce918bf3aa178b1dadec97c91de1c.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 10,
        views: 550,
        range: "170",
        past_owners: [
            {
                sale_date: "2020-07-22",
                sale_price: 8899,
                seller_name: "Honda Dealer",
                buyer_name: "Suman Das"
            },
            {
                sale_date: "2023-02-14",
                sale_price: 7150,
                seller_name: "Suman Das",
                buyer_name: "Ravi Shankar"
            }
        ]
    },
    {
        name: "Kushaq",
        brand: "Skoda",
        model: "Kushaq",
        model_year: 2024,
        price: 19399,
        currency: "USD",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "18.09 kmpl",
        body_type: "SUV",
        seating_capacity: 5,
        available_colors: ["Honey Orange", "Silver", "Gray"],
        registration_number: null,
        insurance_validity: "Jan 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Brand new Skoda Kushaq Style 1.5 TSI DSG. Incredible performance.",
        thumbnail_image: "https://i.pinimg.com/1200x/db/83/04/db83040af95ecda21c7602ff19b637bf.jpg",
        images: [
            "https://i.pinimg.com/736x/88/d3/c1/88d3c1b8975a8a6bc623c2af4912d27b.jpg",
            "https://i.pinimg.com/1200x/52/de/43/52de43b4677b9826681515453adcddcf.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 5,
        views: 1300,
        range: "185",
        past_owners: []
    },
    {
        name: "Taigun",
        brand: "Volkswagen",
        model: "Taigun",
        model_year: 2024,
        price: 19950,
        currency: "USD",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "18.18 kmpl",
        body_type: "SUV",
        seating_capacity: 5,
        available_colors: ["Persimmon Red", "Silver", "Gray"],
        registration_number: null,
        insurance_validity: "Feb 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Volkswagen Taigun GT Plus. Enthusiast's delight with sharp styling.",
        thumbnail_image: "https://i.pinimg.com/1200x/eb/75/6d/eb756dec8913f902e8aea1a3558f074c.jpg",
        images: [
            "https://i.pinimg.com/1200x/0b/67/24/0b67242e75f5b5e5da4653b6f0521da3.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 8,
        views: 1500,
        range: "190",
        past_owners: []
    },
    {
        name: "Fronx",
        brand: "Maruti Suzuki",
        model: "Fronx",
        model_year: 2024,
        price: 11550,
        currency: "USD",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "20.01 kmpl",
        body_type: "SUV",
        seating_capacity: 5,
        available_colors: ["Aurora Silver", "Silver", "Gray"],
        registration_number: null,
        insurance_validity: "Mar 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "The shape of new. Maruti Suzuki Fronx with a bold SUV stance.",
        thumbnail_image: "https://i.pinimg.com/736x/e6/5a/a2/e65aa273cc8da33992cd1a2c52e4c1a2.jpg",
        images: [
            "https://i.pinimg.com/736x/7a/24/2d/7a242dc5366040807abe05eaa4d63a1b.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 12,
        views: 2200,
        range: "175",
        past_owners: []
    },
    {
        name: "Verna",
        brand: "Hyundai",
        model: "Verna",
        model_year: 2024,
        price: 18350,
        currency: "USD",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "18.6 kmpl",
        body_type: "Sedan",
        seating_capacity: 5,
        available_colors: ["Titan Grey", "Silver", "Gray"],
        registration_number: null,
        insurance_validity: "Apr 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "All new Hyundai Verna. Futuristic design with ADAS level 2.",
        thumbnail_image: "https://i.pinimg.com/736x/c3/c1/b4/c3c1b47dfa3d7410a0456eb7fcd8b3b4.jpg",
        images: [
            "https://i.pinimg.com/1200x/2c/58/af/2c58af64964a7eb7938714bcdb7ec02f.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 10,
        views: 1800,
        range: "180",
        past_owners: []
    },
    {
        name: "Aura",
        brand: "Hyundai",
        model: "Aura",
        model_year: 2024,
        price: 9450,
        currency: "USD",
        condition: "New",
        number_of_owners: 0,
        transmission: "Manual",
        fuel_type: "CNG",
        mileage: "28.0 km/kg",
        body_type: "Sedan",
        seating_capacity: 5,
        available_colors: ["Aurora Silver", "Silver", "Gray"],
        registration_number: null,
        insurance_validity: "May 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Hyundai Aura CNG. Very economical and perfect for city commutes.",
        thumbnail_image: "https://i.pinimg.com/1200x/af/96/ce/af96ce60b343f53e3ade8e2a9fb921dd.jpg",
        images: [
            "https://i.pinimg.com/1200x/80/77/25/8077257e94f9b11cae736367dfe52018.jpg",
            "https://i.pinimg.com/1200x/7f/9a/6d/7f9a6d7bc80d9c5d8ef67b22182d8982.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 15,
        views: 900,
        range: "160",
        past_owners: []
    },
    {
        name: "Tiago",
        brand: "Tata",
        model: "Tiago",
        model_year: 2024,
        price: 7850,
        currency: "USD",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "19.0 kmpl",
        body_type: "Hatchback",
        seating_capacity: 5,
        available_colors: ["Flame Red", "Silver", "Gray"],
        registration_number: null,
        insurance_validity: "Jun 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Tata Tiago AMT. Safe, peppy, and affordable.",
        thumbnail_image: "https://i.pinimg.com/736x/0c/7e/92/0c7e9238788faaf93958bad0ee4f3e05.jpg",
        images: [
            "https://i.pinimg.com/736x/77/c6/f8/77c6f855d93fa38f60464b39459a61bd.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 12,
        views: 1050,
        range: "155",
        past_owners: []
    },
    {
        name: "Bolero Neo",
        brand: "Mahindra",
        model: "Bolero",
        model_year: 2024,
        price: 13099,
        currency: "USD",
        condition: "New",
        number_of_owners: 0,
        transmission: "Manual",
        fuel_type: "Diesel",
        mileage: "17.29 kmpl",
        body_type: "SUV",
        seating_capacity: 7,
        available_colors: ["Olive Green Metallic", "Silver", "Gray"],
        registration_number: null,
        insurance_validity: "Jul 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Tough and rugged Bolero Neo. Body on frame construction.",
        thumbnail_image: "https://i.pinimg.com/736x/1a/91/42/1a91420380b8d7ccc7abd9049a09b80f.jpg",
        images: [
            "https://i.pinimg.com/1200x/7d/6d/90/7d6d90ad0fffae5a48c28e8c271341a8.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 5,
        views: 1400,
        range: "170",
        past_owners: []
    },
    {
        name: "Triber",
        brand: "Renault",
        model: "Triber",
        model_year: 2024,
        price: 9250,
        currency: "USD",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "18.2 kmpl",
        body_type: "MUV",
        seating_capacity: 7,
        available_colors: ["Metal Mustard", "Silver", "Gray"],
        registration_number: null,
        insurance_validity: "Aug 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Versatile 7 seater from Renault. Great space management.",
        thumbnail_image: "https://i.pinimg.com/1200x/57/f1/26/57f126e74d31c6bd02b7d9c6bf19a141.jpg",
        images: [
            "https://i.pinimg.com/1200x/51/3a/13/513a13655d61f6a7ae665623c4f6e5af.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 15,
        views: 980,
        range: "165",
        past_owners: []
    },
    {
        name: "Glanza",
        brand: "Toyota",
        model: "Glanza",
        model_year: 2024,
        price: 9950,
        currency: "USD",
        condition: "New",
        number_of_owners: 0,
        transmission: "Manual",
        fuel_type: "Petrol",
        mileage: "22.3 kmpl",
        body_type: "Hatchback",
        seating_capacity: 5,
        available_colors: ["Sportin Red", "Silver", "Gray"],
        registration_number: null,
        insurance_validity: "Sep 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Toyota's premium hatchback. Reliability and high fuel efficiency.",
        thumbnail_image: "https://i.pinimg.com/736x/f5/d6/fa/f5d6faf9db238c653baefb1b7b7a0851.jpg",
        images: [
            "https://i.pinimg.com/1200x/98/3b/e9/983be94c7252384bd00fcfe2a9fb921dd.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 10,
        views: 1150,
        range: "170",
        past_owners: []
    },
    {
        name: "Urban Cruiser Hyryder",
        brand: "Toyota",
        model: "Urban Cruiser",
        model_year: 2024,
        price: 20999,
        currency: "USD",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Hybrid",
        mileage: "27.97 kmpl",
        body_type: "SUV",
        seating_capacity: 5,
        available_colors: ["Imperial Blue", "Silver", "Gray"],
        registration_number: null,
        insurance_validity: "Oct 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Strong hybrid SUV offering unmatched fuel efficiency in its segment.",
        thumbnail_image: "https://i.pinimg.com/736x/b4/10/c9/b410c9f1f332d67275e860533d715d36.jpg",
        images: [
            "https://i.pinimg.com/1200x/0f/4d/e7/0f4de729f452e36f693bedac9239e500.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 5,
        views: 2600,
        range: "180",
        past_owners: []
    }
];

const sample_bookings = [
    {
        user_name: "Amit Sharma",
        user_email: "amit.sharma@example.com",
        user_contact: "9876543210",
        status: "Accepted",
        selected_color: "Black",
        emi_details: { opted: true, tenure: 48, downPaymentPct: 20, annualRate: 8.5 }
    },
    {
        user_name: "Priya Patel",
        user_email: "priya.p@gmail.com",
        user_contact: "8765432109",
        status: "Accepted",
        selected_color: "White"
    },
    {
        user_name: "Vikram Singh",
        user_email: "vikram.s@outlook.com",
        user_contact: "7654321098",
        status: "Accepted",
        selected_color: "Silver"
    },
    {
        user_name: "Sneha Reddy",
        user_email: "sneha.reddy@yahoo.com",
        user_contact: "9988776655",
        status: "Accepted",
        selected_color: "Nexa Blue"
    },
    {
        user_name: "Anjali Verma",
        user_email: "anjali.v@gmail.com",
        user_contact: "8765432109",
        status: "Pending",
        selected_color: "Grey",
        emi_details: { opted: true, tenure: 36, downPaymentPct: 30, annualRate: 9.0 }
    },
    {
        user_name: "Sandeep Gupta",
        user_email: "sandeep.gupta@outlook.com",
        user_contact: "7654321098",
        status: "Rejected",
        selected_color: "Red"
    },
    {
        user_name: "Rohan Kapoor",
        user_email: "rohan.k@example.com",
        user_contact: "9123456789",
        status: "Pending",
        selected_color: "Blue"
    }
];

const seedPrivate = async () => {
    try {
        console.log("Running private database seeding (Postgres/Sequelize)...");
        await connectDB();

        // Sync tables
        await Car.sync({ alter: true });
        await Booking.sync({ alter: true });


        let created = 0;
        let updated = 0;

        for (const carData of private_cars) {
            const existingCar = await Car.findOne({
                where: {
                    [Op.or]: [
                        { name: carData.name },
                        { name: `${carData.brand} ${carData.name}` }
                    ],
                    brand: carData.brand,
                    model_year: carData.model_year,
                }
            });

            if (existingCar) {
                await existingCar.update({
                    ...carData,
                    price: carData.price,
                    image_url: carData.thumbnail_image,
                    secondary_images: carData.images || [],
                });
                updated += 1;


            } else {
                const car = await Car.create({
                    ...carData,
                    price: carData.price,
                    image_url: carData.thumbnail_image,
                    secondary_images: carData.images || [],
                });
                created += 1;


            }
        }

        // Seed bookings with proper mapping to car status
        console.log("Seeding sample bookings...");
        const allCars = await Car.findAll();

        let acceptedIndex = 0;
        let otherIndex = 0;
        const acceptedSamples = sample_bookings.filter(b => b.status === 'Accepted');
        const otherSamples = sample_bookings.filter(b => b.status !== 'Accepted');

        for (const car of allCars) {
            let bookingToCreate = null;

            if (car.availability_status === 'Sold') {
                // Ensure every sold car has an accepted booking
                const sample = acceptedSamples[acceptedIndex % acceptedSamples.length];
                bookingToCreate = {
                    ...sample,
                    user_email: sample.user_email,
                    car_id: car._id,
                    selected_color: car.available_colors?.[0] || 'Black',
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 2000000000))
                };
                acceptedIndex++;
            } else if (Math.random() > 0.6) {
                // Give some available cars pending or rejected bookings
                const sample = otherSamples[otherIndex % otherSamples.length];
                bookingToCreate = {
                    ...sample,
                    user_email: sample.user_email,
                    car_id: car._id,
                    selected_color: car.available_colors?.[0] || 'Black',
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
                };
                otherIndex++;
            }

            if (bookingToCreate) {
                if (bookingToCreate.emi_details) {
                    const P = car.price * (1 - bookingToCreate.emi_details.downPaymentPct / 100);
                    const r = (bookingToCreate.emi_details.annualRate / 100) / 12;
                    const n = bookingToCreate.emi_details.tenure;
                    const emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
                    bookingToCreate.emi_details = { ...bookingToCreate.emi_details, monthlyEmi: emi };
                }

                const existingBooking = await Booking.findOne({
                    where: {
                        user_email: bookingToCreate.user_email,
                        car_id: bookingToCreate.car_id
                    }
                });

                if (!existingBooking) {
                    await Booking.create(bookingToCreate);
                }
            }
        }

        console.log(`Private vehicle seed data loaded. Created: ${created}, Updated: ${updated}`);

        // Seed Additional Admins and Users (Append)
        const private_users = [
            { full_name: "System Admin", email: "admin@test.com", password: "password123", role: "admin" },
            // Additional Admins
            { full_name: "Private Admin 1", email: "admin1@pri.com", password: "pri123", role: "admin" },
            { full_name: "Private Admin 2", email: "admin2@pri.com", password: "pri123", role: "admin" },
            { full_name: "Private Admin 3", email: "admin3@pri.com", password: "pri123", role: "admin" },
            { full_name: "Private Admin 4", email: "admin4@pri.com", password: "pri123", role: "admin" },
            { full_name: "Private Admin 5", email: "admin5@pri.com", password: "pri123", role: "admin" },
        ];

        console.log("Seeding private auxiliary accounts...");
        for (const userData of private_users) {
            const [admin, created] = await Admin.findOrCreate({
                where: { email: userData.email },
                defaults: userData,
                individualHooks: true
            });

            if (!created) {
                // If already exists, force update the password to the default seeded value
                admin.password = userData.password;
                await admin.save({ individualHooks: true });
            }
        }
        console.log("Private auxiliary accounts seeded!");

        process.exit(0);
    } catch (err) {
        console.error("Error seeding private data:", err);
        process.exit(1);
    }
};

seedPrivate();
