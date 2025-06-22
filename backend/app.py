from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from yt_dlp import YoutubeDL
import os

app = FastAPI()

# Enable CORS for all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOWNLOADS_DIR = os.path.join(os.path.dirname(__file__), "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

class DownloadRequest(BaseModel):
    video_url: str

@app.post("/api/download")
async def download_video(data: DownloadRequest):
    video_url = data.video_url.strip()
    if not video_url:
        raise HTTPException(status_code=400, detail="Please provide a YouTube URL.")

    try:
        ydl_opts = {
            "format": "best",
            "outtmpl": os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s"),
        }
        with YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(video_url, download=True)
            video_title = info_dict.get("title", "video")
            video_filename = ydl.prepare_filename(info_dict)
        return {
            "message": "Downloaded successfully!",
            "title": video_title,
            "filename": os.path.basename(video_filename)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/")
async def root():
    return {"message": "FastAPI backend running!"}