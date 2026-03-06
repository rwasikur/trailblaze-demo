from pymongo import MongoClient
import datetime
import uuid

client = MongoClient('mongodb://localhost:27017/')
db = client['trailblazeauto']
cars_collection = db['cars']

private_cars = [
    {
        "_id": str(uuid.uuid4()),
        "name": "S-Class Private",
        "brand": "Mercedes",
        "model_year": 2024,
        "transmission": "Automatic",
        "fuel_type": "Hybrid",
        "seating_capacity": 4,
        "price_per_day": 120000,
        "description": "Luxurious Mercedes S-Class ready for purchase by VIP clients. Unmatched comfort and ownership experience.",
        "image_url": "https://images.unsplash.com/photo-1618751590483-e2213e2f9dca",
        "secondary_images": [],
        "availability_status": "Available",
        "requested_by": "",
        "clickCount": 430,
        "rating": 4.9,
        "reviewsCount": 35,
        "wishlistCount": 87,
        "range": "N/A",
        "body_type": "Luxury Sedan",
        "mileage": "12 kmpl",
        "exterior_color": "Obsidian Black",
        "interior_color": "Beige Leather",
        "number_of_owners": 0,
        "registration_city": "Mumbai",
        "insurance_validity": "2027",
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    },
    {
        "_id": str(uuid.uuid4()),
        "name": "911 Carrera Private",
        "brand": "Porsche",
        "model_year": 2023,
        "transmission": "Manual",
        "fuel_type": "Petrol",
        "seating_capacity": 2,
        "price_per_day": 185000,
        "description": "Premium Porsche 911 coupe available for immediate acquisition. Secure this performance machine today.",
        "image_url": "https://images.unsplash.com/photo-1503376713174-889812423de8",
        "secondary_images": [],
        "availability_status": "Available",
        "requested_by": "",
        "clickCount": 512,
        "rating": 5.0,
        "reviewsCount": 8,
        "wishlistCount": 140,
        "range": "N/A",
        "body_type": "Coupe",
        "mileage": "9 kmpl",
        "exterior_color": "Guards Red",
        "interior_color": "Black",
        "number_of_owners": 1,
        "registration_city": "Delhi",
        "insurance_validity": "2025",
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    },
    {
        "_id": str(uuid.uuid4()),
        "name": "Defender 110",
        "brand": "Land Rover",
        "model_year": 2023,
        "transmission": "Automatic",
        "fuel_type": "Diesel",
        "seating_capacity": 7,
        "price_per_day": 105000,
        "description": "Tough and capable SUV. Claim ownership of this adventure-ready dealership highlight.",
        "image_url": "https://images.unsplash.com/photo-1608472535032-6a6c024d9c7d",
        "secondary_images": [],
        "availability_status": "Available",
        "requested_by": "",
        "clickCount": 210,
        "rating": 4.7,
        "reviewsCount": 22,
        "wishlistCount": 65,
        "range": "N/A",
        "body_type": "SUV",
        "mileage": "11 kmpl",
        "exterior_color": "Pangea Green",
        "interior_color": "Acorn",
        "number_of_owners": 0,
        "registration_city": "Pune",
        "insurance_validity": "2026",
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    }
]

# Wipe old if exist and insert new
cars_collection.delete_many({})
cars_collection.insert_many(private_cars)
print("Private seed data loaded!")
