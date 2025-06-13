from fastapi import FastAPI, File, UploadFile
import cv2
import numpy as np

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Risk Alert is running!"}

@app.post("/upload")
async def analyze_image(file: UploadFile = File(...)):
    # Read image file as bytes
    image_bytes = await file.read()
    image_np = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    # Placeholder hazard detection logic
    hazards_detected = ["Missing safety gear", "Potential fire hazard"]

    return {"hazards": hazards_detected}
