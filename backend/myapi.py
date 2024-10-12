from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from google.cloud import vision
from google.oauth2 import service_account
import os
import openai

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to restrict allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")


# Path to your service account JSON file
SERVICE_ACCOUNT_JSON = "./stocksafe.json"

# Create a client using the service account credentials
credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_JSON)
client = vision.ImageAnnotatorClient(credentials=credentials)

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    # Read the image file
    contents = await file.read()
    
    # Create an Image object for the Vision API
    image = vision.Image(content=contents)
    
    # Call the Web Detection feature
    response = client.web_detection(image=image)

    # Initialize a list to hold exact matches
    exact_matches = []

    if response.web_detection:
        if response.web_detection.full_matching_images:
            for match in response.web_detection.full_matching_images:
                url = match.url  # Get the URL of the exact match
                exact_matches.append(url)

        # If no exact matches were found
        if not exact_matches:
            return JSONResponse(content={"message": "No exact matches found."}, status_code=404)

        # Return the found URLs
        return {"exact_matches": exact_matches}  # Ensure this line is executed
    else:
        return JSONResponse(content={"message": "No web detection results returned."}, status_code=404)

@app.post("/perplexity/chat")
async def perplexity_chat(messages: list):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        return {"response": response['choices'][0]['message']['content']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
