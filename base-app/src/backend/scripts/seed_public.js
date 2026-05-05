const { connectDB } = require('../config/db');
const { Op } = require('sequelize');
const Car = require('../models/Car');
const Admin = require('../models/Admin');
const Booking = require('../models/Booking');

const public_cars = [
    {
        name: "Dzire",
        brand: "Maruti Suzuki",
        model: "Dzire",
        model_year: 2018,
        price: 450000,
        currency: "INR",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Manual",
        fuel_type: "Petrol",
        mileage: "21.21 kmpl",
        total_distance_covered: "45,000 km",
        body_type: "Hatchback",
        seating_capacity: 5,
        exterior_color: "White",
        interior_color: "Black",
        registration_number: "MH02AB1234",
        registration_city: "Mumbai",
        registration_state: "Maharashtra",
        registration_year: 2018,
        insurance_validity: "Oct 2024",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Well-maintained Maruti Suzuki Swift LXi. Single owner, regular servicing done at authorized service center. Good fuel economy and perfect for city driving.",
        thumbnail_image: "https://i.pinimg.com/1200x/a0/86/71/a086718b056e41421eaebc4996d71f09.jpg",
        images: [
            "https://i.pinimg.com/1200x/b7/f7/51/b7f7518ecd19cf75e6dc0def9060e747.jpg",
            "https://i.pinimg.com/1200x/f8/d8/4a/f8d84af03ab51178865e65365406e9ef.jpg"
        ],
        availability_status: "Sold",
        discount_percentage: 5,
        views: 854,
        range: "160",
        past_owners: [
            {
                sale_date: "2018-05-15",
                sale_price: 750000,
                seller_name: "Maruti Suzuki Arena",
                buyer_name: "Rajesh Kumar"
            }
        ]
    },
    {
        name: "Elite i20",
        brand: "Hyundai",
        model: "i20",
        model_year: 2019,
        price: 550000,
        currency: "INR",
        condition: "Used",
        number_of_owners: 2,
        transmission: "Manual",
        fuel_type: "Petrol",
        mileage: "20.35 kmpl",
        total_distance_covered: "32,000 km",
        body_type: "Hatchback",
        seating_capacity: 5,
        exterior_color: "Polar White",
        interior_color: "Beige",
        registration_number: "DL01CD5678",
        registration_city: "New Delhi",
        registration_state: "Delhi",
        registration_year: 2019,
        insurance_validity: "Dec 2024",
        insurance_type: "Third Party",
        rc_status: "Active",
        description: "Premium Hyundai i20 Asta with alloy wheels and touchscreen infotainment. Very clean interior and exterior.",
        thumbnail_image: "https://i.pinimg.com/736x/43/92/95/43929567de08994099a9a62ce2b0ce7c.jpg",
        images: [
            "https://i.pinimg.com/736x/f4/7a/ed/f47aedc76ee298fb4c4d53ad917b8703.jpg",
            "https://i.pinimg.com/736x/17/33/d6/1733d6f49180f6069be4bea1411e3fe7.jpg",
            "https://i.pinimg.com/1200x/d5/b6/da/d5b6daba6bed1b3be603ef3909ee2983.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 20,
        views: 1205,
        range: "170",
        past_owners: [
            {
                sale_date: "2019-02-10",
                sale_price: 825000,
                seller_name: "Hyundai Motor Plaza",
                buyer_name: "Amit Shah"
            },
            {
                sale_date: "2021-11-20",
                sale_price: 680000,
                seller_name: "Amit Shah",
                buyer_name: "Priya Sharma"
            }
        ]
    },
    {
        name: "Nexon EV",
        brand: "Tata",
        model: "Nexon",
        model_year: 2020,
        price: 950000,
        currency: "INR",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Automatic",
        fuel_type: "Electric",
        mileage: "21.5 kmpl",
        total_distance_covered: "28,000 km",
        body_type: "SUV",
        seating_capacity: 5,
        exterior_color: "Foliage Blue",
        interior_color: "Black and White",
        registration_number: "KA03EF9012",
        registration_city: "Bengaluru",
        registration_state: "Karnataka",
        registration_year: 2020,
        insurance_validity: "Mar 2025",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "5-star safety rated Tata Nexon XZ+ Diesel AMT. Excellent condition with zero dep insurance.",
        thumbnail_image: "https://i.pinimg.com/736x/ea/da/97/eada975877a30336f0ce7d324c55eee7.jpg",
        images: [
            "https://i.pinimg.com/736x/b1/73/3e/b1733e6aac68b136d7e6f28f8cde98fb.jpg",
            "https://i.pinimg.com/736x/d3/fe/57/d3fe577cee48932b03476ce8e10a0e96.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 5,
        views: 450,
        range: "120",
        past_owners: [
            {
                sale_date: "2020-08-12",
                sale_price: 1250000,
                seller_name: "Tata Motors Dealer",
                buyer_name: "Suresh Menon"
            }
        ]
    },
    {
        name: "Thar LX",
        brand: "Mahindra",
        model: "Thar",
        model_year: 2021,
        price: 1050000,
        currency: "INR",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Automatic",
        fuel_type: "Diesel",
        mileage: "15.2 kmpl",
        total_distance_covered: "15,000 km",
        body_type: "SUV",
        seating_capacity: 4,
        exterior_color: "Red Rage",
        interior_color: "Black",
        registration_number: "TS09GH3456",
        registration_city: "Hyderabad",
        registration_state: "Telangana",
        registration_year: 2021,
        insurance_validity: "Jan 2025",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Mahindra Thar LX Hard Top Diesel Automatic. Rarely used for off-roading. Modifications include custom alloy wheels and premium audio.",
        thumbnail_image: "https://i.pinimg.com/1200x/d9/97/3b/d9973b0bb2d30a58e9da9d5979874778.jpg",
        images: [
            "https://i.pinimg.com/736x/41/50/92/4150920d20fbbf974cc5cbbdaa49a7ec.jpg",
            "https://i.pinimg.com/736x/1b/d7/61/1bd7616b64d1eb5207021fced8495e35.jpg"
        ],
        availability_status: "Sold",
        discount_percentage: 8,
        views: 2500,
        range: "155",
        past_owners: [
            {
                sale_date: "2021-03-22",
                sale_price: 1250000,
                seller_name: "Mahindra Showroom",
                buyer_name: "Karan Johar"
            }
        ]
    },
    {
        name: "City ZX",
        brand: "Honda",
        model: "City",
        model_year: 2017,
        price: 720000,
        currency: "INR",
        condition: "Used",
        number_of_owners: 2,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "18 kmpl",
        total_distance_covered: "55,000 km",
        body_type: "Sedan",
        seating_capacity: 5,
        exterior_color: "White",
        interior_color: "Black Leather",
        registration_number: "GJ01IJ7890",
        registration_city: "Ahmedabad",
        registration_state: "Gujarat",
        registration_year: 2017,
        insurance_validity: "Nov 2024",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Top end Honda City ZX CVT with sunroof and leather seats. Very smooth drive and excellent cabin space.",
        thumbnail_image: "https://i.pinimg.com/736x/ff/1a/c1/ff1ac17cc8ca54f4258679aa879b8d1b.jpg",
        images: [
            "https://i.pinimg.com/1200x/9b/57/05/9b5705842e0ae772dc440451a57f7241.jpg",
            "https://i.pinimg.com/1200x/e1/2f/71/e12f71393ec1430cd03bd23a59f6039a.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 10,
        views: 670,
        range: "180",
        past_owners: [
            {
                sale_date: "2017-06-14",
                sale_price: 1350000,
                seller_name: "Deccan Honda",
                buyer_name: "Vikram Singh"
            },
            {
                sale_date: "2020-09-05",
                sale_price: 950000,
                seller_name: "Vikram Singh",
                buyer_name: "Anjali Gupta"
            }
        ]
    },
    {
        name: "Innova Crysta",
        brand: "Toyota",
        model: "Innova Crysta",
        model_year: 2018,
        price: 1850000,
        currency: "INR",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Automatic",
        fuel_type: "Diesel",
        mileage: "13.68 kmpl",
        total_distance_covered: "85,000 km",
        body_type: "MUV",
        seating_capacity: 7,
        exterior_color: "Super White",
        interior_color: "Camel Brown Leather",
        registration_number: "TN09KL1234",
        registration_city: "Chennai",
        registration_state: "Tamil Nadu",
        registration_year: 2018,
        insurance_validity: "Feb 2025",
        insurance_type: "Third Party",
        rc_status: "Active",
        description: "Highly reliable Toyota Innova Crysta. Top model with captain seats and automatic transmission.",
        thumbnail_image: "https://i.pinimg.com/736x/4b/6a/9d/4b6a9d184003e00c1077441d5d73ed64.jpg",
        images: [
            "https://i.pinimg.com/1200x/21/3f/69/213f691b5ff4fc35461a01daf2907a6f.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 15,
        views: 3200,
        range: "175",
        past_owners: [
            {
                sale_date: "2018-11-30",
                sale_price: 2300000,
                seller_name: "Toyota Lanson",
                buyer_name: "Ramesh Babu"
            }
        ]
    },
    {
        name: "Seltos HTX",
        brand: "Kia",
        model: "Seltos",
        model_year: 2020,
        price: 1250000,
        currency: "INR",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Manual",
        fuel_type: "Petrol",
        mileage: "16.5 kmpl",
        total_distance_covered: "22,000 km",
        body_type: "SUV",
        seating_capacity: 5,
        exterior_color: "Glacier White Pearl",
        interior_color: "Black",
        registration_number: "HR26MN5678",
        registration_city: "Gurgaon",
        registration_state: "Haryana",
        registration_year: 2020,
        insurance_validity: "Aug 2024",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Well maintained Kia Seltos HTX. Features a sunroof, 10.25-inch display, and air purifier.",
        thumbnail_image: "https://i.pinimg.com/1200x/44/f2/5c/44f25cd4711d7d7601f4026029ffaaad.jpg",
        images: [
            "https://i.pinimg.com/1200x/11/f8/bf/11f8bf97e3594144a2affc572b7dd722.jpg",
            "https://i.pinimg.com/1200x/db/ff/4a/dbff4a407f09dd85de710e3477cfb755.jpg"
        ],
        availability_status: "Sold",
        discount_percentage: 0,
        views: 980,
        range: "170",
        past_owners: [
            {
                sale_date: "2020-01-15",
                sale_price: 1400000,
                seller_name: "Kia Motors India",
                buyer_name: "Neha Sharma"
            }
        ]
    },
    {
        name: "EcoSport Titanium",
        brand: "Ford",
        model: "EcoSport",
        model_year: 2019,
        price: 580000,
        currency: "INR",
        condition: "Used",
        number_of_owners: 2,
        transmission: "Manual",
        fuel_type: "Diesel",
        mileage: "21.7 kmpl",
        total_distance_covered: "48,000 km",
        body_type: "SUV",
        seating_capacity: 5,
        exterior_color: "Diamond White",
        interior_color: "Black",
        registration_number: "WB02OP9012",
        registration_city: "Kolkata",
        registration_state: "West Bengal",
        registration_year: 2019,
        insurance_validity: "Sep 2024",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Solid build Ford EcoSport. Great driving dynamics, diesel engine provides excellent punch and economy.",
        thumbnail_image: "https://i.pinimg.com/1200x/ef/d4/0a/efd40ade52ed54f4808b5872ff33a2d3.jpg",
        images: [
            "https://i.pinimg.com/736x/0f/2c/1f/0f2c1fefcc6f6ebdd8e48901f62c4587.jpg",
            "https://i.pinimg.com/1200x/c5/ad/00/c5ad008eee3df6507724263cda992889.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 5,
        views: 410,
        range: "165",
        past_owners: [
            {
                sale_date: "2019-07-20",
                sale_price: 950000,
                seller_name: "Ganges Ford",
                buyer_name: "Arun Bose"
            },
            {
                sale_date: "2022-04-10",
                sale_price: 750000,
                seller_name: "Arun Bose",
                buyer_name: "Meera Das"
            }
        ]
    },
    {
        name: "Polo GTI",
        brand: "Volkswagen",
        model: "Polo",
        model_year: 2016,
        price: 920000,
        currency: "INR",
        condition: "Used",
        number_of_owners: 3,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "16.47 kmpl",
        total_distance_covered: "60,000 km",
        body_type: "Hatchback",
        seating_capacity: 5,
        exterior_color: "White",
        interior_color: "Black and Grey",
        registration_number: "UP16QR3456",
        registration_city: "Noida",
        registration_state: "Uttar Pradesh",
        registration_year: 2016,
        insurance_validity: "Jan 2025",
        insurance_type: "Third Party",
        rc_status: "Active",
        description: "Enthusiast's choice Polo GT TSI with the legendary 7-speed DSG. Mechanically sound and serviced regularly.",
        thumbnail_image: "https://i.pinimg.com/1200x/58/5f/20/585f204e876a1f781b1f92d5154351d0.jpg",
        images: [
            "https://i.pinimg.com/736x/99/c1/de/99c1deb472b3ef93fbece8fe97517801.jpg",
            "https://i.pinimg.com/736x/d5/85/bf/d585bf7fb3be8854345cbb0912f31d54.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 0,
        views: 850,
        range: "230",
        past_owners: [
            {
                sale_date: "2016-04-12",
                sale_price: 2850000,
                seller_name: "VW Noida",
                buyer_name: "Ravi Teja"
            },
            {
                sale_date: "2019-08-25",
                sale_price: 2050000,
                seller_name: "Ravi Teja",
                buyer_name: "Sanjay Dutt"
            },
            {
                sale_date: "2022-12-05",
                sale_price: 1550000,
                seller_name: "Sanjay Dutt",
                buyer_name: "Kabir Singh"
            }
        ]
    },
    {
        name: "Duster RXZ",
        brand: "Renault",
        model: "Duster",
        model_year: 2018,
        price: 600000,
        currency: "INR",
        condition: "Used",
        number_of_owners: 1,
        transmission: "Manual",
        fuel_type: "Diesel",
        mileage: "19.87 kmpl",
        total_distance_covered: "72,000 km",
        body_type: "SUV",
        seating_capacity: 5,
        exterior_color: "blue & black",
        interior_color: "Black",
        registration_number: "KL01ST7890",
        registration_city: "Trivandrum",
        registration_state: "Kerala",
        registration_year: 2018,
        insurance_validity: "May 2025",
        insurance_type: "Comprehensive",
        rc_status: "Active",
        description: "Rugged Renault Duster with brilliant ride quality. Perfect for long trips and broken roads.",
        thumbnail_image: "https://i.pinimg.com/736x/8a/c4/11/8ac4112707b8b3189b61b8692d8e5f1f.jpg",
        images: [
            "https://i.pinimg.com/736x/45/84/39/458439885eec665ece6180e3e36037d8.jpg"
        ],
        availability_status: "Sold",
        discount_percentage: 8,
        views: 330,
        range: "160",
        past_owners: [
            {
                sale_date: "2018-09-18",
                sale_price: 1050000,
                seller_name: "Renault Trivandrum",
                buyer_name: "John Mathew"
            }
        ]
    },
    {
        name: "Safari Accomplished",
        brand: "Tata",
        model: "Safari",
        model_year: 2024,
        price: 2549000,
        currency: "INR",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Diesel",
        mileage: "14.5 kmpl",
        body_type: "SUV",
        seating_capacity: 7,
        exterior_color: "Cosmic Gold",
        interior_color: "Black",
        registration_number: null,
        insurance_validity: "Jan 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Brand new Tata Safari Accomplished AT. Experience premium luxury with advanced ADAS, panoramic sunroof, and 7-seater comfort.",
        thumbnail_image: "https://i.pinimg.com/1200x/86/f9/7e/86f97ef63f30f448f49b768884c41137.jpg",
        images: [
            "https://i.pinimg.com/1200x/bb/0f/8f/bb0f8fae28e202c57273f0075812ebe4.jpg",
            "https://i.pinimg.com/1200x/54/42/94/544294887db31768e18f7e2a8be5ed72.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 20,
        views: 1500,
        range: "175"
    },
    {
        name: "XUV700 AX7",
        brand: "Mahindra",
        model: "XUV700",
        model_year: 2024,
        price: 2499000,
        currency: "INR",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "13 kmpl",
        body_type: "SUV",
        seating_capacity: 7,
        exterior_color: "Midnight Black",
        interior_color: "Black",
        registration_number: null,
        insurance_validity: "Jan 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Mahindra XUV700 AX7 Luxury Pack. Equipped with Alexa, ADAS level 2, and massive dual screens.",
        thumbnail_image: "https://i.pinimg.com/736x/5d/03/cc/5d03cc06ea4f7bb38be73453058c7ed1.jpg",
        images: [
            "https://i.pinimg.com/736x/19/25/3e/19253ecb44acbceb319c17d0337e460e.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 20,
        views: 4200,
        range: "190"
    },
    {
        name: "Creta SX(O)",
        brand: "Hyundai",
        model: "Creta",
        model_year: 2024,
        price: 2015000,
        currency: "INR",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "18.4 kmpl",
        body_type: "SUV",
        seating_capacity: 5,
        exterior_color: "Abyss Black",
        interior_color: "Beige",
        registration_number: null,
        insurance_validity: "Feb 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "The all-new Hyundai Creta SX(O) IVT. Segment defining SUV with updated design and class-leading features.",
        thumbnail_image: "https://i.pinimg.com/1200x/62/f9/43/62f943b1e5b75150850cb39e9e33e798.jpg",
        images: [
            "https://i.pinimg.com/736x/0d/19/e1/0d19e17706b66f63d75d9e669efce8c4.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 8,
        views: 2100,
        range: "180"
    },
    {
        name: "Grand Vitara Alpha",
        brand: "Maruti Suzuki",
        model: "Grand Vitara",
        model_year: 2024,
        price: 1999000,
        currency: "INR",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Hybrid",
        mileage: "27.97 kmpl",
        body_type: "SUV",
        seating_capacity: 5,
        exterior_color: "Nexa Blue",
        interior_color: "Bordeaux and Black",
        registration_number: null,
        insurance_validity: "Mar 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Maruti Suzuki Grand Vitara Strong Hybrid Alpha. Experience exceptional fuel economy and silent EV mode driving.",
        thumbnail_image: "https://i.pinimg.com/1200x/68/be/94/68be94762044f8fc662a1844b3eadda1.jpg",
        images: [
            "https://i.pinimg.com/1200x/67/7a/8f/677a8ffd2bf7d8ad33dd9a403eb2d52c.jpg",
            "https://i.pinimg.com/1200x/56/38/55/563855e4137b11c99506c4b8399c43ec.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 20,
        views: 1800,
        range: "170"
    },
    {
        name: "Sonet X-Line",
        brand: "Kia",
        model: "Sonet",
        model_year: 2024,
        price: 1499000,
        currency: "INR",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Diesel",
        mileage: "19.0 kmpl",
        body_type: "SUV",
        seating_capacity: 5,
        exterior_color: "White",
        interior_color: "Black",
        registration_number: null,
        insurance_validity: "Apr 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Kia Sonet X-Line Diesel AT. The most aggressive and feature-rich compact SUV in its segment.",
        thumbnail_image: "https://i.pinimg.com/736x/2d/b2/ba/2db2ba68804becb5bff9d9f3392e9b03.jpg",
        images: [
            "https://i.pinimg.com/1200x/db/53/c4/db53c492437c6f62df15733f38e575da.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 8,
        views: 950,
        range: "170"
    },
    {
        name: "Fortuner Legender",
        brand: "Toyota",
        model: "Fortuner",
        model_year: 2024,
        price: 4366000,
        currency: "INR",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Diesel",
        mileage: "14.4 kmpl",
        body_type: "SUV",
        seating_capacity: 7,
        exterior_color: "Pearl White with Black Roof",
        interior_color: "Black & Maroon",
        registration_number: null,
        insurance_validity: "Jan 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Toyota Fortuner Legender 4x2 AT. The boss of Indian roads with unmatched presence and reliability.",
        thumbnail_image: "https://i.pinimg.com/736x/31/44/7e/31447e81b70fa293c1cf0abaf84dcc48.jpg",
        images: [
            "https://i.pinimg.com/736x/cd/ca/44/cdca44acbd0a4a1c72092d452984dc1e.jpg",
            "https://i.pinimg.com/1200x/54/c8/e3/54c8e313b16f964f1b380bceddb9bcde.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 12,
        views: 5200,
        range: "180"
    },
    {
        name: "Hector Savvy Pro",
        brand: "MG",
        model: "Hector",
        model_year: 2024,
        price: 2199000,
        currency: "INR",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "13.5 kmpl",
        body_type: "SUV",
        seating_capacity: 5,
        exterior_color: "Aurora Silver",
        interior_color: "Oak White and Black",
        registration_number: null,
        insurance_validity: "May 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "MG Hector Savvy Pro CVT. Features a massive 14-inch HD portrait infotainment system and Level 2 ADAS.",
        thumbnail_image: "https://i.pinimg.com/736x/e7/cc/31/e7cc31959dabb14ada838c150ea8f00a.jpg",
        images: [
            "https://i.pinimg.com/1200x/2e/2f/41/2e2f41dddb177e8c09ef76245792f1dc.jpg",
            "https://i.pinimg.com/736x/a6/43/79/a6437978fe2f4e133804f32608032e16.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 5,
        views: 1100,
        range: "175"
    },
    {
        name: "Slavia Style",
        brand: "Skoda",
        model: "Slavia",
        model_year: 2024,
        price: 1899000,
        currency: "INR",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "18.73 kmpl",
        body_type: "Sedan",
        seating_capacity: 5,
        exterior_color: "Crystal White",
        interior_color: "Black",
        registration_number: null,
        insurance_validity: "Feb 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Skoda Slavia Style 1.5 TSI DSG. The most powerful sedan in its class offering true European driving dynamics.",
        thumbnail_image: "https://i.pinimg.com/736x/4b/21/2e/4b212e983a1d803b484be3d05cfd844d.jpg",
        images: [
            "https://i.pinimg.com/1200x/0a/71/08/0a7108395a0feff54a556914fa0e496d.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 15,
        views: 1350,
        range: "190"
    },
    {
        name: "Elevate ZX",
        brand: "Honda",
        model: "Elevate",
        model_year: 2024,
        price: 1630000,
        currency: "INR",
        condition: "New",
        number_of_owners: 0,
        transmission: "Automatic",
        fuel_type: "Petrol",
        mileage: "16.92 kmpl",
        body_type: "SUV",
        seating_capacity: 5,
        exterior_color: "Crimson Red",
        interior_color: "Black",
        registration_number: null,
        insurance_validity: "Mar 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Honda Elevate ZX CVT. Honda's latest SUV offering unmatched comfort, class-leading ground clearance, and Honda Sensing ADAS.",
        thumbnail_image: "https://i.pinimg.com/736x/48/a1/6c/48a16cdded03dc96894ef37514ad836c.jpg",
        images: [
            "https://i.pinimg.com/736x/1f/85/da/1f85daf874e5fed742ab8c284bfee1ff.jpg",
            "https://i.pinimg.com/736x/57/cd/8c/57cd8c547e1e9a107988637fa591cd1c.jpg"
        ],
        availability_status: "Available",
        discount_percentage: 12,
        views: 1650,
        range: "160"
    },
    {
        name: "Punch Creative",
        brand: "Tata",
        model: "Punch",
        model_year: 2024,
        price: 899000,
        currency: "INR",
        condition: "New",
        number_of_owners: 0,
        transmission: "Manual",
        fuel_type: "Petrol",
        mileage: "20.09 kmpl",
        body_type: "SUV",
        seating_capacity: 5,
        exterior_color: "Tornado Blue",
        interior_color: "Grey/Black",
        registration_number: null,
        insurance_validity: "May 2027",
        insurance_type: "Comprehensive",
        rc_status: "Pending",
        description: "Tata Punch Creative. Micro SUV with 5-star Global NCAP safety rating and bold design.",
        thumbnail_image: "https://i.pinimg.com/736x/b8/36/52/b8365283ad256ebb48983d0676314f3e.jpg",
        images: [
            "https://i.pinimg.com/736x/98/55/a9/9855a979dbd0c838bda623b44ccccbfa.jpg",
            "https://i.pinimg.com/1200x/eb/47/16/eb47164471c352554d944f8ad20b7259.jpg",
            "https://i.pinimg.com/736x/71/a1/bc/71a1bc6af0247be157085cddfd86bc1d.jpg",
            "https://i.pinimg.com/736x/94/4c/b2/944cb27445e22e2c57e4c9716ff09e86.jpg"
        ],
        availability_status: "Sold",
        discount_percentage: 12,
        views: 800,
        range: "150"
    }
];

const sample_bookings = [
    {
        user_name: "Rahul Sharma",
        user_email: "rahul.sharma@example.com",
        user_contact: "9876543210",
        status: "Accepted"
    },
    {
        user_name: "Anjali Verma",
        user_email: "anjali.v@gmail.com",
        user_contact: "8765432109",
        status: "Pending"
    },
    {
        user_name: "Sandeep Gupta",
        user_email: "sandeep.gupta@outlook.com",
        user_contact: "7654321098",
        status: "Rejected"
    },
    {
        user_name: "Pooja Reddy",
        user_email: "pooja.reddy@yahoo.com",
        user_contact: "9988776655",
        status: "Pending"
    }
];

const seedPublic = async () => {
    try {
        console.log("Running public database seeding...");
        await connectDB();
        await Car.sync({ alter: true });
        await Booking.sync({ alter: true });

        let created = 0;
        let updated = 0;

        for (const carData of public_cars) {
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

                updated += 1;
            } else {
                const car = await Car.create({
                    ...carData,
                    price: carData.price,
                    image_url: carData.thumbnail_image,
                    secondary_images: carData.images || [],
                });
                created += 1;

                created += 1;
            }
        }

        // Seed some sample bookings
        console.log("Seeding sample bookings...");
        const allCars = await Car.findAll();
        for (let i = 0; i < sample_bookings.length; i++) {
            const bookingData = sample_bookings[i];
            // Assign to different cars
            const car = allCars[i % allCars.length];

            // For 'Accepted' booking, ensure car is 'Sold'
            if (bookingData.status === 'Accepted' && car.availability_status !== 'Sold') {
                await car.update({ availability_status: 'Sold' });
            }

            // Check if booking already exists for this user and car
            const existingBooking = await Booking.findOne({
                where: {
                    user_email: bookingData.user_email,
                    car_id: car._id
                }
            });

            if (!existingBooking) {
                await Booking.create({
                    ...bookingData,
                    car_id: car._id
                });
            }
        }

        console.log(`Public car sync complete. Created: ${created}, Updated: ${updated}`);

        // Seed Additional Admins and Users (Append)
        const public_users = [
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
