from pymongo import MongoClient
import datetime
import uuid

client = MongoClient('mongodb://localhost:27017/')
db = client['trailblazeauto']
cars_collection = db['cars']

public_cars = [
    {
        "_id": str(uuid.uuid4()),
        "name": "Camry Hybrid",
        "brand": "Toyota",
        "model_year": 2023,
        "transmission": "Automatic",
        "fuel_type": "Hybrid",
        "seating_capacity": 5,
        "price_per_day": 45000,
        "description": "Reliable and fuel-efficient luxury sedan ready for new ownership. Book this car to secure your purchase.",
        "image_url": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?",
        "secondary_images": [],
        "availability_status": "Available",
        "requested_by": "",
        "clickCount": 340,
        "rating": 4.8,
        "reviewsCount": 112,
        "wishlistCount": 45,
        "range": "900 km",
        "body_type": "Sedan",
        "mileage": "20 kmpl",
        "exterior_color": "Pearl White",
        "interior_color": "Beige",
        "number_of_owners": 0,
        "registration_city": "Mumbai",
        "insurance_validity": "2025",
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    },
    {
        "_id": str(uuid.uuid4()),
        "name": "Mustang GT",
        "brand": "Ford",
        "model_year": 2022,
        "transmission": "Automatic",
        "fuel_type": "Petrol",
        "seating_capacity": 4,
        "price_per_day": 52000,
        "description": "Iconic American muscle car providing exhilarating performance. Perfect vehicle for your garage.",
        "image_url": "https://images.unsplash.com/photo-1584345604476-8ec5e12e42a5",
        "secondary_images": [],
        "availability_status": "Available",
        "requested_by": "",
        "clickCount": 650,
        "rating": 4.6,
        "reviewsCount": 89,
        "wishlistCount": 120,
        "range": "450 km",
        "body_type": "Coupe",
        "mileage": "8 kmpl",
        "exterior_color": "Yellow",
        "interior_color": "Black",
        "number_of_owners": 1,
        "registration_city": "Delhi",
        "insurance_validity": "2024",
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    },
    {
        "_id": str(uuid.uuid4()),
        "name": "Creta",
        "brand": "Hyundai",
        "model_year": 2024,
        "transmission": "Manual",
        "fuel_type": "Diesel",
        "seating_capacity": 5,
        "price_per_day": 21000,
        "description": "The ultimate compact SUV that balances style, comfort, and advanced features perfectly. Available for immediate purchase.",
        "image_url": "https://images.unsplash.com/photo-1669022716186-f831d0440cb2",
        "secondary_images": [],
        "availability_status": "Available",
        "requested_by": "",
        "clickCount": 210,
        "rating": 4.5,
        "reviewsCount": 310,
        "wishlistCount": 85,
        "range": "650 km",
        "body_type": "SUV",
        "mileage": "18 kmpl",
        "exterior_color": "Typhoon Silver",
        "interior_color": "Dual Tone",
        "number_of_owners": 1,
        "registration_city": "Bangalore",
        "insurance_validity": "2026",
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    }
]

# Wipe old if exist and insert new
cars_collection.delete_many({})
cars_collection.insert_many(public_cars)
print("Public seed data loaded!")
