import os
import base64
import tempfile
import time
import random
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from yt_dlp import YoutubeDL
from typing import Optional

# Configuration
DOWNLOADS_DIR = os.path.join(os.path.dirname(__file__), "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DownloadRequest(BaseModel):
    video_url: str
    format: Optional[str] = 'mp4'
    quality: Optional[str] = '720p'

class ClipRequest(BaseModel):
    video_url: str
    start_time: str
    end_time: str
    format: Optional[str] = 'mp4'
    quality: Optional[str] = '720p'

def create_cookies_tempfile():
    """Create temporary cookies file from base64 environment variable"""
    cookies_b64 = os.environ.get("YT_COOKIES_B64")
    if not cookies_b64:
        return None
    
    try:
        cookies_content = base64.b64decode(cookies_b64).decode('utf-8')
        fd, path = tempfile.mkstemp(suffix='.txt')
        with os.fdopen(fd, 'w') as tmp:
            tmp.write(cookies_content)
        return path
    except Exception as e:
        print(f"Error processing cookies: {str(e)}")
        return None

def get_ydl_options(request_format, request_quality):
    """Generate YouTube DL options with proper headers and settings"""
    quality_map = {
        '144p': 'worst',
        '240p': 'worst',
        '360p': 'worst[height<=360]',
        '480p': 'worst[height<=480]',
        '720p': 'best[height<=720]',
        '1080p': 'best[height<=1080]',
        '4k': 'best[height<=2160]'
    }
    
    return {
        "format": quality_map.get(request_quality, 'best[height<=720]'),
        "outtmpl": os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s"),
        "merge_output_format": request_format,
        "retries": 5,
        "fragment_retries": 5,
        "extractor_retries": 3,
        "socket_timeout": 30,
        "extract_flat": False,
        "force_ipv4": True,
        "nocheckcertificate": True,
        "quiet": False,
        "no_warnings": False,
        "http_headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.youtube.com/",
        }
    }

def download_with_retry(video_url, ydl_opts, max_retries=3):
    """Download with retry logic and proper cookie handling"""
    cookies_path = create_cookies_tempfile()
    if cookies_path:
        ydl_opts["cookiefile"] = cookies_path
    
    last_error = None
    for attempt in range(max_retries):
        try:
            with YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(video_url, download=True)
                video_filename = ydl.prepare_filename(info_dict)
                return video_filename, info_dict
        except Exception as e:
            last_error = e
            if "HTTP Error 429" in str(e) or "HTTP Error 403" in str(e):
                wait_time = (2 ** attempt) + random.uniform(0, 1)
                print(f"Rate limited (attempt {attempt + 1}). Waiting {wait_time:.2f} seconds...")
                time.sleep(wait_time)
                continue
            break
        finally:
            if cookies_path and os.path.exists(cookies_path):
                os.remove(cookies_path)
    
    raise last_error if last_error else Exception("Download failed")

@app.post("/api/download")
async def download_video(request: DownloadRequest):
    video_url = request.video_url.strip()
    if not video_url:
        raise HTTPException(status_code=400, detail="YouTube URL required")

    try:
        print(f"Processing: {video_url} (Format: {request.format}, Quality: {request.quality})")
        
        ydl_opts = get_ydl_options(request.format, request.quality)
        video_filename, info_dict = download_with_retry(video_url, ydl_opts)
        
        return {
            "message": "Download successful",
            "title": info_dict.get("title", "video"),
            "filename": os.path.basename(video_filename)
        }
    except Exception as e:
        error_msg = str(e)
        if "HTTP Error 429" in error_msg:
            error_msg = "YouTube rate limit exceeded. Try again later."
        elif "HTTP Error 403" in error_msg:
            error_msg = "Access denied. Cookies may be invalid or expired."
        elif "This content isn't available" in error_msg:
            error_msg = "Content unavailable (private/removed/geoblocked)"
        
        print(f"Download failed: {error_msg}")
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )

# ... [keep your existing /api/clip and /api/download-file endpoints unchanged] ...

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)))