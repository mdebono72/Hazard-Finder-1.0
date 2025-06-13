from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Risk Alert is running!"}
