import os
import base64
import tempfile
import time
import random
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from yt_dlp import YoutubeDL
from typing import Optional
import traceback

# Configuration
app = FastAPI(
    title="YouTube Downloader API",
    description="Production-ready YouTube downloader with cookie authentication",
    version="1.0.0",
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    video_url: str
    format: Optional[str] = 'mp4'
    quality: Optional[str] = '720p'

# Helper Functions
def validate_cookies(cookies_content: str) -> bool:
    """Validate that cookies contain required YouTube fields"""
    required_markers = ["youtube.com", "LOGIN_INFO", "VISITOR_INFO"]
    return all(marker in cookies_content for marker in required_markers)

def create_temp_cookies() -> Optional[str]:
    """Create temporary cookies file from base64 env var"""
    cookies_b64 = os.getenv("YT_COOKIES_B64")
    if not cookies_b64:
        logger.warning("No cookies provided in YT_COOKIES_B64")
        return None

    try:
        cookies_content = base64.b64decode(cookies_b64).decode('utf-8')
        if not validate_cookies(cookies_content):
            logger.error("Invalid cookies - missing required fields")
            return None
            
        fd, path = tempfile.mkstemp(suffix='.txt')
        with os.fdopen(fd, 'w') as tmp:
            tmp.write(cookies_content)
        return path
    except Exception as e:
        logger.error(f"Cookie processing failed: {str(e)}")
        return None

def get_ydl_config(quality: str, format: str) -> dict:
    """Return optimized YouTube DL configuration"""
    quality_map = {
        '144p': 'worst',
        '240p': 'worst[height>=144][height<=240]',
        '360p': 'worst[height>=240][height<=360]',
        '480p': 'worst[height>=360][height<=480]',
        '720p': 'best[height>=480][height<=720]',
        '1080p': 'best[height>=720][height<=1080]',
        '4k': 'best[height>=1080]'
    }
    
    return {
        'format': quality_map.get(quality, 'best[height<=720]'),
        'merge_output_format': format,
        'outtmpl': '%(title)s.%(ext)s',
        'retries': 10,
        'fragment_retries': 10,
        'extractor_retries': 5,
        'socket_timeout': 60,
        'extract_flat': False,
        'force_ipv4': True,
        'nocheckcertificate': True,
        'quiet': True,
        'no_warnings': False,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.youtube.com/',
        },
        'cookiefile': create_temp_cookies(),
    }

# Endpoints
@app.get("/")
async def root():
    return {
        "status": "active",
        "service": "YouTube Downloader",
        "endpoints": {
            "/download": "POST - Download videos",
            "/health": "GET - Service health check"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/download")
async def download_video(request: DownloadRequest):
    """Robust download endpoint with exponential backoff"""
    if not request.video_url.strip():
        raise HTTPException(400, "YouTube URL required")

    ydl_opts = get_ydl_config(request.quality, request.format)
    last_error = None

    for attempt in range(3):  # Max 3 attempts
        try:
            with YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(request.video_url, download=True)
                filename = ydl.prepare_filename(info)
                
                return {
                    "status": "success",
                    "filename": os.path.basename(filename),
                    "title": info.get('title'),
                    "duration": info.get('duration'),
                    "available_formats": list(info.get('formats', []))
                }

        except Exception as e:
            last_error = e
            if attempt == 2:  # Final attempt
                break

            # Exponential backoff with jitter
            wait_time = (2 ** attempt) + random.random()
            logger.warning(f"Attempt {attempt+1} failed. Retrying in {wait_time:.1f}s")
            time.sleep(wait_time)

    # Handle final error
    error_map = {
        429: "YouTube rate limit exceeded - try again later",
        403: "Access denied - check your cookies",
        404: "Video not found or unavailable",
    }

    error_detail = str(last_error)
    status_code = 500
    for code, message in error_map.items():
        if str(code) in error_detail:
            status_code = code
            error_detail = message
            break

    logger.error(f"Download failed: {error_detail}")
    raise HTTPException(status_code, detail=error_detail)

@app.get("/download/{filename}")
async def serve_file(filename: str):
    """Serve downloaded files"""
    if not os.path.exists(filename):
        raise HTTPException(404, "File not found")
    return FileResponse(filename)

# Startup
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000)),
        workers=2,
        timeout_keep_alive=60
    )