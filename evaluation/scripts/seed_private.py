from pymongo import MongoClient
import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client['trailblazeauto']
cars_collection = db['cars']

private_cars = [
    {
        "name": "S-Class Private",
        "brand": "Mercedes",
        "model_year": 2024,
        "transmission": "Automatic",
        "fuel_type": "Hybrid",
        "seating_capacity": 4,
        "price_per_day": 15000,
        "description": "Luxurious Mercedes exclusively for private fleet.",
        "image_url": "https://images.unsplash.com/photo-1618751590483-e2213e2f9dca",
        "secondary_images": [],
        "availability_status": "Available",
        "requested_by": "",
        "clickCount": 0,
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    },
    {
        "name": "911 Carrera Private",
        "brand": "Porsche",
        "model_year": 2023,
        "transmission": "Manual",
        "fuel_type": "Petrol",
        "seating_capacity": 2,
        "price_per_day": 25000,
        "description": "Porsche 911 restricted to premium private users.",
        "image_url": "https://images.unsplash.com/photo-1503376713174-889812423de8",
        "secondary_images": [],
        "availability_status": "Available",
        "requested_by": "",
        "clickCount": 0,
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    }
]

cars_collection.insert_many(private_cars)
print("Private seed data loaded!")
