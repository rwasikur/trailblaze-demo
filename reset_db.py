from pymongo import MongoClient

try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['trailblazeauto']
    cars_collection = db['cars']
    
    # Reset all statuses exactly to Available
    result = cars_collection.update_many({}, {"$set": {"availability_status": "Available", "requested_by": ""}})
    print(f"Reset {result.modified_count} cars to Available status.")
except Exception as e:
    print(f"Error: {e}")
