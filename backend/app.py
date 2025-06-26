import os
import time
import random
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from yt_dlp import YoutubeDL
from typing import Optional
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class DownloadRequest(BaseModel):
    url: str
    format: Optional[str] = "mp4"
    quality: Optional[str] = "720p"

# Helper Functions
def get_ydl_opts(request: DownloadRequest):
    """Generate optimized YouTube DL configuration"""
    return {
        'format': f'bestvideo[height<={request.quality[:-1]}]+bestaudio/best',
        'merge_output_format': request.format,
        'outtmpl': 'downloads/%(id)s.%(ext)s',
        'retries': 10,
        'fragment_retries': 10,
        'extractor_retries': 3,
        'socket_timeout': 30,
        'extract_flat': False,
        'force_ipv4': True,
        'nocheckcertificate': True,
        'quiet': True,
        'no_warnings': False,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        'throttledratelimit': 1000000,
    }

# Endpoints
@app.get("/")
async def root():
    return {"status": "active", "service": "YouTube Downloader"}

@app.post("/download")
async def download_video(request: DownloadRequest):
    """Robust download endpoint with retry logic"""
    if not request.url.strip():
        raise HTTPException(400, detail="URL cannot be empty")

    ydl_opts = get_ydl_opts(request)
    download_id = str(uuid.uuid4())
    ydl_opts['outtmpl'] = f'downloads/{download_id}.%(ext)s'

    try:
        for attempt in range(3):  # Max 3 attempts
            try:
                with YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(request.url, download=True)
                    filename = f"{download_id}.{request.format}"
                    return {
                        "status": "success",
                        "filename": filename,
                        "title": info.get('title'),
                        "duration": info.get('duration')
                    }
            except Exception as e:
                if attempt == 2:  # Final attempt
                    raise
                wait_time = (2 ** attempt) + random.random()
                logger.warning(f"Attempt {attempt+1} failed, retrying in {wait_time:.1f}s")
                time.sleep(wait_time)

    except Exception as e:
        error_msg = str(e)
        if "HTTP Error 429" in error_msg:
            error_msg = "YouTube rate limit exceeded - try again later"
        elif "unavailable" in error_msg:
            error_msg = "Video unavailable (may be private or removed)"
        logger.error(f"Download failed: {error_msg}")
        raise HTTPException(500, detail=error_msg)

@app.get("/download/{filename}")
async def serve_file(filename: str):
    """Serve downloaded files"""
    filepath = os.path.join("downloads", filename)
    if not os.path.exists(filepath):
        raise HTTPException(404, detail="File not found")
    return FileResponse(filepath)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))