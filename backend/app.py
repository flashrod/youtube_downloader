import os
import glob
import time
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from yt_dlp import YoutubeDL

# Setup downloads directory
DOWNLOADS_DIR = os.path.join(os.path.dirname(__file__), "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

# Path to cookies.txt (should be in same directory as this script)
COOKIES_PATH = os.path.join(os.path.dirname(__file__), "cookies.txt")

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

class ClipRequest(BaseModel):
    video_url: str
    start_time: str  # e.g. "00:01:00"
    end_time: str    # e.g. "00:02:00"

@app.post("/api/download")
async def download_video( DownloadRequest):
    video_url = data.video_url.strip()
    if not video_url:
        raise HTTPException(status_code=400, detail="Please provide a YouTube URL.")

    try:
        print("Download requested for:", video_url)
        ydl_opts = {
            "format": "bestvideo+bestaudio/best",
            "outtmpl": os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s"),
            "merge_output_format": "mp4",
            "cookiefile": COOKIES_PATH,  # ADDED COOKIES
        }
        with YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(video_url, download=True)
            video_title = info_dict.get("title", "video")
            video_filename = ydl.prepare_filename(info_dict)
        print("Downloaded file:", video_filename)
        return {
            "message": "Downloaded successfully!",
            "title": video_title,
            "filename": os.path.basename(video_filename)
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/api/clip")
async def clip_video( ClipRequest):
    video_url = data.video_url.strip()
    start_time = data.start_time.strip()
    end_time = data.end_time.strip()
    if not video_url or not start_time or not end_time:
        raise HTTPException(status_code=400, detail="Please provide a YouTube URL, start time, and end time.")

    try:
        print(f"Clip requested for: {video_url} | {start_time} - {end_time}")
        print("Files BEFORE yt-dlp:", os.listdir(DOWNLOADS_DIR))
        # Download to a temp file for clipping
        temp_filename = os.path.join(DOWNLOADS_DIR, "temp_for_clip.mp4")
        ydl_opts = {
            "format": "bestvideo+bestaudio/best",
            "outtmpl": temp_filename,
            "merge_output_format": "mp4",
            "noplaylist": True,
            "socket_timeout": 30,
            "retries": 10,
            "fragment_retries": 20,
            "cookiefile": COOKIES_PATH,  # ADDED COOKIES
        }
        print("yt-dlp options:", ydl_opts)
        with YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(video_url, download=True)
            video_title = info_dict.get("title", "clip")
        print("Files AFTER yt-dlp:", os.listdir(DOWNLOADS_DIR))

        # Make safe output name for the clip
        safe_title = "".join(c for c in video_title if c.isalnum() or c in " .-_").rstrip()
        clip_filename = f"{safe_title}.clip.mp4"
        clip_filepath = os.path.join(DOWNLOADS_DIR, clip_filename)

        # Clip with ffmpeg
        ffmpeg_cmd = [
            "ffmpeg", "-y",
            "-i", temp_filename,
            "-ss", start_time,
            "-to", end_time,
            "-c", "copy",
            clip_filepath
        ]
        print("FFmpeg command:", " ".join(ffmpeg_cmd))
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        print("FFmpeg stdout:", result.stdout)
        print("FFmpeg stderr:", result.stderr)
        if result.returncode != 0 or not os.path.exists(clip_filepath):
            raise Exception("FFmpeg failed to create the clip.")

        # Remove the temp file
        try:
            os.remove(temp_filename)
            print(f"Deleted temp file: {temp_filename}")
        except Exception as e:
            print(f"Warning: Could not delete temp file: {e}")

        return {
            "message": "Clipped video created successfully!",
            "title": video_title,
            "filename": clip_filename,
            "start_time": start_time,
            "end_time": end_time
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/api/download-file/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(DOWNLOADS_DIR, filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')

@app.get("/")
async def root():
    return {"message": "FastAPI backend running!"}
