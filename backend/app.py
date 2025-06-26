import os
import uvicorn
import subprocess
import logging
import base64
from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, constr
from yt_dlp import YoutubeDL

# --- Basic Setup & Configuration ---

# Configure logging to see output in Render's logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Setup a directory for downloaded media.
# On Render, this is an ephemeral filesystem, meaning files are deleted on deploy/restart.
DOWNLOADS_DIR = os.path.join(os.getcwd(), "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

# Define the path for the cookies file. It will be created dynamically.
COOKIES_PATH = os.path.join(os.getcwd(), "cookies.txt")

# --- Load Cookies from Base64 Environment Variable ---
# This securely loads your cookie data at runtime without hardcoding it.
logger.info("Checking for YT_COOKIES_B64 environment variable...")
base64_cookies = os.environ.get("YT_COOKIES_B64")

if base64_cookies:
    try:
        logger.info("Found YT_COOKIES_B64, decoding and writing to file...")
        # Decode the Base64 string into bytes
        decoded_cookies = base64.b64decode(base64_cookies)
        # Write the decoded bytes to the cookies.txt file
        with open(COOKIES_PATH, "wb") as f:
            f.write(decoded_cookies)
        logger.info(f"Successfully wrote cookies to {COOKIES_PATH}")
    except Exception as e:
        logger.error(f"Failed to decode or write cookies from environment variable: {e}")
else:
    logger.warning("YT_COOKIES_B64 environment variable not set. yt-dlp will proceed without cookies, which may cause errors.")


# Initialize FastAPI app
app = FastAPI(
    title="Video Downloader API",
    description="An API to download and clip videos from various sources using yt-dlp.",
    version="1.1.0"
)

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# --- Pydantic Models for Input Validation ---
class DownloadRequest(BaseModel):
    video_url: HttpUrl
    format: str = 'mp4'
    quality: str = '720p'

class ClipRequest(BaseModel):
    video_url: HttpUrl
    start_time: constr(pattern=r'^\d{2}:\d{2}:\d{2}$')  # HH:MM:SS format
    end_time: constr(pattern=r'^\d{2}:\d{2}:\d{2}$')    # HH:MM:SS format
    format: str = 'mp4'
    quality: str = '720p'


# --- Custom Exception Handlers ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": "Unprocessable Entity", "errors": exc.errors()})

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"An unexpected error occurred: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "An internal server error occurred."})


# --- API Endpoints ---

@app.post("/api/download", summary="Download a full video")
async def download_video(request: DownloadRequest):
    logger.info(f"Download request: {request.video_url} | Format={request.format} | Quality={request.quality}")
    try:
        ydl_opts = {
            "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "outtmpl": os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s"),
            "merge_output_format": request.format,
            "noplaylist": True,
        }
        # Use cookies file if it was successfully created from the env var
        if os.path.exists(COOKIES_PATH):
            ydl_opts["cookiefile"] = COOKIES_PATH
            logger.info("Using cookies file for download.")

        with YoutubeDL(ydl_opts) as ydl:
            # We must convert Pydantic's HttpUrl to a string for yt-dlp
            info_dict = ydl.extract_info(str(request.video_url), download=True)
            video_title = info_dict.get("title", "video")
            video_filename = ydl.prepare_filename(info_dict)

        logger.info(f"Successfully downloaded: {video_filename}")
        return {"message": "Downloaded successfully!", "title": video_title, "filename": os.path.basename(video_filename)}
    except Exception as e:
        # Catch specific yt-dlp errors if possible
        if "This content isn’t available" in str(e) or "Private video" in str(e):
             raise HTTPException(status_code=403, detail="The requested content is private, unavailable, or requires a login with premium access.")
        logger.error(f"Error during video download: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to download video. It might be private, age-restricted, or otherwise unavailable.")


@app.post("/api/clip", summary="Create a clip from a video")
async def clip_video(request: ClipRequest):
    logger.info(f"Clip request: {request.video_url} | {request.start_time}-{request.end_time}")
    temp_filename = os.path.join(DOWNLOADS_DIR, f"temp_{os.urandom(8).hex()}.mp4")

    try:
        ydl_opts = {
            "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "outtmpl": temp_filename,
            "merge_output_format": "mp4",
            "noplaylist": True,
        }
        if os.path.exists(COOKIES_PATH):
            ydl_opts["cookiefile"] = COOKIES_PATH
            logger.info("Using cookies file for clipping.")

        with YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(str(request.video_url), download=True)
            video_title = info_dict.get("title", "clip")

        safe_title = "".join(c for c in video_title if c.isalnum() or c in " .-_").rstrip()
        clip_filename = f"{safe_title}_{request.start_time}_{request.end_time}.clip.mp4".replace(":", "-")
        clip_filepath = os.path.join(DOWNLOADS_DIR, clip_filename)
        
        ffmpeg_cmd = ["ffmpeg", "-y", "-i", temp_filename, "-ss", request.start_time, "-to", request.end_time, "-c", "copy", clip_filepath]
        
        logger.info(f"Running FFmpeg command: {' '.join(ffmpeg_cmd)}")
        result = subprocess.run(ffmpeg_cmd, check=True, capture_output=True, text=True)

        if not os.path.exists(clip_filepath):
            raise Exception("FFmpeg did not produce an output file.")

        logger.info(f"Successfully created clip: {clip_filepath}")
        return {"message": "Clipped video created successfully!", "title": video_title, "filename": clip_filename}
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error: {e.stderr}")
        raise HTTPException(status_code=500, detail=f"FFmpeg failed: {e.stderr}")
    except Exception as e:
        logger.error(f"Error during video clipping: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create clip: {str(e)}")
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
            logger.info(f"Removed temporary file: {temp_filename}")


@app.get("/api/download-file/{filename}", summary="Download a processed file")
async def download_file(filename: str):
    file_path = os.path.join(DOWNLOADS_DIR, filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')


@app.get("/", summary="Root endpoint")
async def root():
    return {"message": "FastAPI video tools backend is running!"}


# --- Main execution block ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
