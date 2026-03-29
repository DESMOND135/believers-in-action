from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime

app = FastAPI(title="Believers in Action: Sermon Platform")

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security ---
SECRET_ADMIN_TOKEN = "pastor2026" # Simple security token for demo

def verify_admin_token(x_admin_token: str = Header(...)):
    """Verifies that the request comes from the pastor."""
    if x_admin_token != SECRET_ADMIN_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Only Pastor Bah UDRICK NIH can perform this action."
        )
    return x_admin_token

# --- Models ---
class Sermon(BaseModel):
    id: str
    title: str
    description: str
    video_url: str
    thumbnail_url: Optional[str] = None
    preach_date: str
    created_at: str

# --- Mock Data for Demo ---
MOCK_SERMONS = [
    {
        "id": "1",
        "title": "The Power of Faith",
        "description": "A powerful sermon exploring how faith can move mountains and transform lives.",
        "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
        "thumbnail_url": "https://images.unsplash.com/photo-1544427928-c49cd03d3600?auto=format&fit=crop&q=80&w=640",
        "preach_date": "March 22, 2026",
    },
    {
        "id": "2",
        "title": "Showers of Blessing",
        "description": "Dive deep into our 2026 motto and discover the promise of divine abundance.",
        "video_url": "https://www.w3schools.com/html/movie.mp4",
        "thumbnail_url": "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=640",
        "preach_date": "March 29, 2026",
    }
]

# --- Endpoints ---
@app.get("/api/sermons", response_model=List[Sermon])
async def get_sermons():
    """Public endpoint to fetch all sermons."""
    return MOCK_SERMONS

@app.post("/api/upload")
async def upload_sermon(
    title: str, 
    description: str, 
    preach_date: str, 
    file: UploadFile = File(...),
    token: str = Depends(verify_admin_token)
):
    """
    Securely upload a new sermon video. 
    Only accessible with the correct 'X-Admin-Token'.
    """
    # Simulate processing
    return {
        "status": "success",
        "message": f"Sermon '{title}' securely published by Pastor Bah UDRICK NIH."
    }

@app.delete("/api/sermons/{id}")
async def delete_sermon(
    id: str, 
    token: str = Depends(verify_admin_token)
):
    """Securely delete a sermon."""
    global MOCK_SERMONS
    original_len = len(MOCK_SERMONS)
    MOCK_SERMONS = [s for s in MOCK_SERMONS if s["id"] != id]
    return {"status": "success", "message": f"Sermon {id} has been removed."}

@app.put("/api/sermons/{id}")
async def update_sermon(
    id: str,
    title: str,
    description: str,
    preach_date: str,
    token: str = Depends(verify_admin_token)
):
    """Securely update sermon metadata."""
    for sermon in MOCK_SERMONS:
        if sermon["id"] == id:
            sermon["title"] = title
            sermon["description"] = description
            sermon["preach_date"] = preach_date
            return {"status": "success", "message": "Updated successfully."}
    raise HTTPException(status_code=404, detail="Sermon not found.")

@app.get("/")
def read_root():
    return {"message": "Welcome to Believers in Action API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
