from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from google.cloud import vision
from google.oauth2 import service_account
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVICE_ACCOUNT_JSON = "./stocksafe.json"

# Create a Google Vision client
credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_JSON)
client = vision.ImageAnnotatorClient(credentials=credentials)

# Hardcoded user for testing
HARD_CODED_USER_ID = 'dd4e78a1-7d98-409a-bec6-0dd6ee5b926b'

@app.post("/upload")
async def upload_and_detect_image(file: UploadFile = File(...)):
    # 1. Save the image to Supabase (using hardcoded user)
    file_name = f"{HARD_CODED_USER_ID}/{file.filename}"
    print(f"Uploading file: {file_name}")
    file_content = await file.read()

    # Upload to Supabase storage
    res = supabase.storage.from_('image-bucket').upload(file_name, file_content)
    if res.get('error'):
        return JSONResponse(status_code=400, content={"error": "Failed to upload to storage", "details": res['error']})

    # Generate file URL
    file_url = f"{SUPABASE_URL}/storage/v1/object/public/image-bucket/{file_name}"

    # 2. Run Google Vision API Web Detection on the image
    image = vision.Image(content=file_content)  # Use the same file content
    response = client.web_detection(image=image)

    exact_matches = []
    if response.web_detection and response.web_detection.full_matching_images:
        for match in response.web_detection.full_matching_images:
            url = match.url
            exact_matches.append(url)

    # Store the image in the `images` table
    image_data = {
        "user_id": HARD_CODED_USER_ID,  # Using hardcoded user
        "image_url": file_url,
        "hash": "image_hash_placeholder"  # Add your image hashing logic here
    }
    image_response = supabase.table('images').insert(image_data).execute()

    if image_response.get('status_code') != 201:
        return JSONResponse(status_code=400, content={"error": "Failed to insert image into database", "details": image_response.get('data')})

    # If exact matches are found, store them in the `stolen_images` table
    if exact_matches:
        stolen_image_data = {
            "user_id": HARD_CODED_USER_ID,  # Using hardcoded user
            "original_image_url": file_url,
            "stolen_image_urls": exact_matches
        }
        stolen_response = supabase.table('stolen_images').insert(stolen_image_data).execute()

        if stolen_response.get('status_code') != 201:
            return JSONResponse(status_code=400, content={"error": "Failed to store stolen image URLs", "details": stolen_response.get('data')})

        return JSONResponse(status_code=200, content={"message": "Image uploaded and stolen image URLs stored", "file_url": file_url, "stolen_image_urls": exact_matches})
    else:
        return JSONResponse(status_code=200, content={"message": "Image uploaded, no stolen images found", "file_url": file_url})

