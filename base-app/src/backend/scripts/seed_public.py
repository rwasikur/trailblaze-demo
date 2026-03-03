from pymongo import MongoClient
import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client['trailblazeauto']
cars_collection = db['cars']

public_cars = [
    {
        "name": "Civic Public",
        "brand": "Honda",
        "model_year": 2022,
        "transmission": "Automatic",
        "fuel_type": "Petrol",
        "seating_capacity": 5,
        "price_per_day": 3000,
        "description": "A very neat Honda Civic available for tracking.",
        "image_url": "https://images.unsplash.com/photo-1590362891991-f776e747a588",
        "secondary_images": [],
        "availability_status": "Available",
        "requested_by": "",
        "clickCount": 0,
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    },
    {
        "name": "Model 3 Public",
        "brand": "Tesla",
        "model_year": 2023,
        "transmission": "Automatic",
        "fuel_type": "Electric",
        "seating_capacity": 5,
        "price_per_day": 8500,
        "description": "Sleek and highly efficient electric vehicle.",
        "image_url": "https://images.unsplash.com/photo-1560958089-b8a1929cea89",
        "secondary_images": [],
        "availability_status": "Available",
        "requested_by": "",
        "clickCount": 0,
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now()
    }
]

cars_collection.insert_many(public_cars)
print("Public seed data loaded!")
