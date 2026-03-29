from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime
import mysql.connector
from mysql.connector import Error

app = FastAPI(title="Believers in Action: Sermon Platform (UDRICK NIH)")

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security ---
SECRET_ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "udrick2026") # Securely load from ENV

def verify_admin_token(x_admin_token: str = Header(...)):
    """Verifies that the request comes from UDRICK NIH."""
    if x_admin_token != SECRET_ADMIN_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Only UDRICK NIH can perform this action."
        )
    return x_admin_token

# --- Models ---
class Sermon(BaseModel):
    id: str
    title: str
    description: str
    video_url: str
    download_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    preach_date: str
    created_at: str

# --- Database Configuration ---
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'church_db'),
    'port': os.getenv('DB_PORT', '3306')
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Simple SQL initialization (Run this at start)
@app.on_event("startup")
async def startup_event():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sermons (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                video_url TEXT,
                download_url TEXT,
                thumbnail_url TEXT,
                preach_date VARCHAR(50),
                created_at DATETIME
            )
        """)
        conn.commit()
        cursor.close()
        conn.close()

# --- Mock Data Fallback ---
MOCK_SERMONS = [
    {
        "id": "1",
        "title": "The Power of Faith",
        "description": "A powerful sermon exploring how faith can move mountains and transform lives.",
        "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
        "download_url": "https://www.w3schools.com/html/mov_bbb.mp4",
        "thumbnail_url": "https://images.unsplash.com/photo-1544427928-c49cd03d3600?auto=format&fit=crop&q=80&w=640",
        "preach_date": "March 22, 2026",
    },
    {
        "id": "2",
        "title": "Showers of Blessing",
        "description": "Dive deep into our 2026 motto and discover the promise of divine abundance.",
        "video_url": "https://www.w3schools.com/html/movie.mp4",
        "download_url": "https://www.w3schools.com/html/movie.mp4",
        "thumbnail_url": "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=640",
        "preach_date": "March 29, 2026",
    }
]

# --- Endpoints ---
@app.get("/api/sermons", response_model=List[Sermon])
async def get_sermons():
    """Public endpoint to fetch all sermons."""
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM sermons ORDER BY created_at DESC")
        result = cursor.fetchall()
        cursor.close()
        conn.close()
        return result
    return MOCK_SERMONS

@app.post("/api/upload")
async def upload_sermon(
    title: str, 
    description: str, 
    preach_date: str, 
    file: UploadFile = File(...),
    token: str = Depends(verify_admin_token)
):
    """Securely upload a new sermon video."""
    new_id = str(len(MOCK_SERMONS) + 1)
    created_at = datetime.now()
    
    # Simulate video/download URLs for demo
    video_url = "https://www.w3schools.com/html/mov_bbb.mp4"
    download_url = video_url
    thumbnail_url = "https://images.unsplash.com/photo-1507679799987-c7377ec486b6?auto=format&fit=crop&q=80&w=640"

    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO sermons (id, title, description, video_url, download_url, thumbnail_url, preach_date, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (new_id, title, description, video_url, download_url, thumbnail_url, preach_date, created_at))
        conn.commit()
        cursor.close()
        conn.close()
    else:
        # Fallback to mock
        new_sermon = {
            "id": new_id, "title": title, "description": description,
            "video_url": video_url, "download_url": download_url,
            "thumbnail_url": thumbnail_url, "preach_date": preach_date,
            "created_at": str(created_at)
        }
        MOCK_SERMONS.insert(0, new_sermon)

    return {"status": "success", "message": f"Sermon '{title}' securely published by UDRICK NIH."}

@app.delete("/api/sermons/{id}")
async def delete_sermon(id: str, token: str = Depends(verify_admin_token)):
    """Securely delete a sermon."""
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sermons WHERE id = %s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
    else:
        global MOCK_SERMONS
        MOCK_SERMONS = [s for s in MOCK_SERMONS if s["id"] != id]
    return {"status": "success", "message": f"Sermon {id} has been removed."}

@app.put("/api/sermons/{id}")
async def update_sermon(id: str, title: str, description: str, preach_date: str, token: str = Depends(verify_admin_token)):
    """Securely update sermon metadata."""
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE sermons SET title=%s, description=%s, preach_date=%s WHERE id=%s
        """, (title, description, preach_date, id))
        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success", "message": "Updated successfully in Database."}
    else:
        for sermon in MOCK_SERMONS:
            if sermon["id"] == id:
                sermon["title"] = title
                sermon["description"] = description
                sermon["preach_date"] = preach_date
                return {"status": "success", "message": "Updated successfully in Mock."}
    raise HTTPException(status_code=404, detail="Sermon not found.")

@app.get("/")
def read_root():
    return {"message": "Welcome to Believers in Action API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
