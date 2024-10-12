from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from google.cloud import vision
from google.oauth2 import service_account
import os

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

# Create a client
credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_JSON)
client = vision.ImageAnnotatorClient(credentials=credentials)

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):

    contents = await file.read() #Read file
    
    image = vision.Image(content=contents)
    
    response = client.web_detection(image=image) #Web detection call

    
    exact_matches = []

    if response.web_detection:
        if response.web_detection.full_matching_images:
            for match in response.web_detection.full_matching_images: #Score logic would be somewhere here if we look for x% similarity scores, else this works for perfect match
                url = match.url  
                exact_matches.append(url)

        
        if not exact_matches:
            return JSONResponse(content={"message": "No exact matches found."}, status_code=404)

       
        return {"exact_matches": exact_matches}  
    else:
        return JSONResponse(content={"message": "No web detection results returned."}, status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
