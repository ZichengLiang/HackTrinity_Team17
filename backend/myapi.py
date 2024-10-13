from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from google.cloud import vision
from google.oauth2 import service_account
from dotenv import load_dotenv
from supabase import create_client, Client
from supabase.client import ClientOptions
from typing import List, Dict
from io import BytesIO
import os
import magic
import hashlib
from chatbot import process_query
from pydantic import BaseModel



# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SERVICE_ACCOUNT_JSON = "./stocksafe.json"

# Create a client using the service account credentials
credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_JSON)
client = vision.ImageAnnotatorClient(credentials=credentials)

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

def generate_image_hash(image_content: bytes) -> str:
    """Generate a SHA-256 hash for the given image content."""
    sha256 = hashlib.sha256()
    sha256.update(image_content)
    return sha256.hexdigest()

@app.post("/upload")
async def upload_and_detect_image(files: List[UploadFile] = File(...)):
    results = []  # Store results for all processed files
    print("works")
    for file in files:
        file_name = file.filename
        print(f"Uploading file: {file_name}")
        file_content = await file.read()
        image_hash = generate_image_hash(file_content)

        # Detect MIME type
        file_mime_type = magic.from_buffer(file_content, mime=True)

        # Upload the file to Supabase
        res = supabase.storage.from_("image-bucket").upload(file_name, file_content, {"mimetype": file_mime_type})

        # Check if the upload was successful
        if res.status_code != 200:
            error_message = getattr(res, 'message', 'Unknown error occurred')
            print(f"Storage upload error for {file_name}: {error_message}")
            return JSONResponse(content={"error": "Failed to upload to storage", "details": error_message})

        # Generate file URL
        file_url = supabase.storage.from_('image-bucket').get_public_url(file_name)

        # Run Google Vision API Web Detection on the image
        image = vision.Image(content=file_content)
        response = client.web_detection(image=image)

        exact_matches = []
        if response.web_detection and response.web_detection.full_matching_images:
            for match in response.web_detection.full_matching_images:
                url = match.url
                exact_matches.append(url)

        # Store the image in the `images` table
        image_data = {
            "user_id": 'dd4e78a1-7d98-409a-bec6-0dd6ee5b926b',  # Use a hardcoded user for testing
            "image_name": file.filename,
            "image_url": file_url,
            "hash": image_hash
        }
        
        image_response = supabase.table('images').insert(image_data).execute()

        if image_response.data:
            image_id = image_response.data[0]['id']
            # If exact matches are found, store them in the `stolen_images` table
            if exact_matches:
                stolen_image_data = {
                    "image_id": image_id,
                    "image_name": file.filename,
                    "image_hash": image_hash,
                    "stolen_url": exact_matches  # Ensure this is an array if your database supports it
                }
                stolen_response = supabase.table('stolen_images').insert(stolen_image_data).execute()
                results.append({"file_name": file_name, "message": "Image uploaded, stolen images found", "stolen_urls": exact_matches})
            else:
                results.append({"file_name": file_name, "message": "Image uploaded, no stolen images found", "file_url": file_url})
        else:
            results.append({"file_name": file_name, "message": "Failed to store image data."})

    return JSONResponse(content={"results": results})  # Return results for all processed files

# Function to get the latest three image names
@app.get("/download_latest_images")
async def get_latest_three_image_names():
    response = (
        supabase.table("images")
        .select("*")
        .order("uploaded_at", desc=True)
        .limit(3)
        .execute()
    )
    
    # Extract the image names and URLs from the response
    images = [{"name": item["image_name"], "url": item["image_url"]} for item in response.data]  # Collect both name and URL
    print(images)  
    return images  # Return a list of dictionaries


# Function to download and return the latest three images as files
@app.get("/download_images")
async def download_latest_images():
    # Step 1: Fetch the latest three image names
    image_names = await get_latest_three_image_names()

    # Step 2: Initialize a list to hold the file paths
    files_to_send = []

    bucket_name = "image-bucket"
    
    # Step 3: Loop through each image name and download it from the storage
    for image_name in image_names:
        image_data = supabase.storage.from_(bucket_name).download(image_name)
        
        # Step 4: Save the image to a temporary file
        file_path = f"/tmp/{image_name}"
        with open(file_path, "wb") as f:
            f.write(image_data)

        # Step 5: Add the file path to the list
        files_to_send.append(file_path)
    
    # Step 6: Return the files with the correct media type
    if len(files_to_send) > 0:
        file_responses = []
        for file_path in files_to_send:
            # Dynamically determine the MIME type based on the file extension
            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type is None:
                mime_type = "application/octet-stream"  # Fallback for unknown file types

            # Return the file with the correct MIME type
            file_responses.append(
                FileResponse(file_path, media_type=mime_type, filename=os.path.basename(file_path))
            )
        return file_responses
    else:
        return {"error": "No images found"}
    





def get_top_5_websites() -> List[Dict[str, int]]:
    """
    Fetch the top 5 websites that have used your images from the stolen_images table.
    Returns a list of dictionaries with domain and count.
    """
    # Query Supabase using the query builder
    try:
        # Using the query builder to select stolen_url data and aggregate
        response = supabase.table('stolen_images').select('stolen_url').execute()
        # Process the results to extract domain and count
        urls = [entry['stolen_url'] for entry in response.data]
        
        # Flatten and count occurrences of each domain
        domain_count = {}
        for url_list in urls:
            for url in url_list:
                domain = extract_domain(url)  # Use helper function to extract domain
                domain_count[domain] = domain_count.get(domain, 0) + 1

        # Sort by count and return the top 5 domains
        sorted_domains = sorted(domain_count.items(), key=lambda x: x[1], reverse=True)[:5]
        return [{"domain": domain, "count": count} for domain, count in sorted_domains]


    except Exception as e:
        return []

def extract_domain(url: str) -> str:
    """
    Helper function to extract the domain from a given URL.
    """
    import re
    pattern = r'(https?://[^/]+)'
    match = re.match(pattern, url)
    return match.group(1) if match else url

@app.get("/top-websites")
async def fetch_top_websites():
    """
    Endpoint to get the top 5 websites that have used the images based on the stolen_images table.
    """
    try:
        top_websites = get_top_5_websites()
        print(top_websites)
        return JSONResponse(content={"top_websites": top_websites})
    except Exception as e:
        return HTTPException(status_code=500, detail = str(e))
    


class UserQuery(BaseModel):
    query: str

#posting chatbot querying2
@app.post("/process_query")
async def handle_query(user_query: UserQuery):
    query_text = user_query.query.strip()
    try:
        result = process_query(query_text)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail=str(re))