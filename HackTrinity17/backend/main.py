from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import List

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

# Sample model to store URLs of stolen images
class StolenImage(BaseModel):
    image_id: str
    stolen_url: str

# Upload a product image to Supabase storage and insert it into the 'images' table
@app.post("/upload/")
async def upload_image(file: UploadFile = File(...), user_id: str = 'user-id-placeholder'):
    # Save file to Supabase storage
    file_name = f"{user_id}/{file.filename}"
    file_content = await file.read()

    res = supabase.storage.from_('image-bucket').upload(file_name, file_content)
    if res.get('error'):
        return {"error": res.get('error')}

    # Generate file URL
    file_url = f"{SUPABASE_URL}/storage/v1/object/public/image-bucket/{file_name}"

    # Insert the image data into the 'images' table
    image_data = {
        "user_id": user_id,
        "image_url": file_url,
        "hash": "image_hash_placeholder"  # Add your image hashing logic here
    }
    response = supabase.table('images').insert(image_data).execute()

    if response.get('status_code') == 201:
        return {"message": "Image uploaded and record created", "file_url": file_url}
    else:
        return {"error": "Failed to insert image into database", "details": response.get('data')}


# Store the stolen image URLs into the 'stolen_images' table
@app.post("/stolen/")
async def store_stolen_image(stolen_image: StolenImage):
    response = supabase.table('stolen_images').insert(stolen_image.dict()).execute()

    if response.get('status_code') == 201:
        return {"message": "Stolen image URL stored successfully"}
    else:
        return {"error": "Failed to store stolen image URL", "details": response.get('data')}


# Get all images uploaded by a specific user
@app.get("/images/{user_id}")
async def get_images(user_id: str):
    response = supabase.table('images').select('*').eq('user_id', user_id).execute()

    if response.get('status_code') == 200:
        return response.get('data')
    else:
        return {"error": "Failed to fetch images", "details": response.get('data')}

