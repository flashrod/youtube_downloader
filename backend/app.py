import os
import time
import random
import logging
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from yt_dlp import YoutubeDL
from typing import Optional

# ✅ Enforce Python 3.10 compatibility
if sys.version_info >= (3, 11):
    raise RuntimeError("Python 3.10 required! Set PYTHON_VERSION=3.10.13 in Render.")

# ✅ Create downloads folder if not exists
os.makedirs("downloads", exist_ok=True)

# ✅ Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Request model
class DownloadRequest(BaseModel):
    url: str
    format: Optional[str] = "mp4"
    quality: Optional[str] = "720p"

# ✅ Helper function to download with retry
def download_video_ytdlp(url: str, ydl_opts: dict):
    for attempt in range(3):
        try:
            with YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                return ydl.prepare_filename(info), info
        except Exception as e:
            if attempt == 2:
                raise
            wait = (2 ** attempt) + random.uniform(0, 1)
            logger.warning(f"Attempt {attempt+1} failed. Retrying in {wait:.1f}s...")
            time.sleep(wait)

# ✅ Health check
@app.get("/")
async def health_check():
    return {"status": "OK", "python_version": sys.version}

# ✅ Video download endpoint
@app.post("/download")
async def download_video(request: DownloadRequest):
    if not request.url.strip():
        raise HTTPException(400, detail="URL required")

    ydl_opts = {
        'format': f'bestvideo[height<={request.quality[:-1]}]+bestaudio/best',
        'outtmpl': 'downloads/%(id)s.%(ext)s',
        'retries': 5,
        'fragment_retries': 5,
        'extractor_retries': 3,
        'socket_timeout': 30,
        'nocheckcertificate': True,
        'quiet': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    }

    try:
        filename, info = download_video_ytdlp(request.url, ydl_opts)
        return {
            "status": "success",
            "filename": os.path.basename(filename),
            "title": info.get("title", "video")
        }
    except Exception as e:
        error_msg = "Rate limited" if "429" in str(e) else "Download failed"
        logger.error(f"{error_msg}: {str(e)}")
        raise HTTPException(500, detail=error_msg)

# ✅ Serve downloaded files
@app.get("/download/{filename}")
async def serve_file(filename: str):
    filepath = os.path.join("downloads", filename)
    if not os.path.exists(filepath):
        raise HTTPException(404, detail="File not found")
    return FileResponse(filepath)

# ✅ Only for local dev (not needed on Render)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)