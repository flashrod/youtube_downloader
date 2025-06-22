import os
import subprocess
from fastapi import FastAPI, HTTPException, Body
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
    format: str = 'mp4'
    quality: str = '720p'

class ClipRequest(BaseModel):
    video_url: str
    start_time: str
    end_time: str
    format: str = 'mp4'
    quality: str = '720p'

@app.post("/api/download")
async def download_video( DownloadRequest = Body(...)):
    video_url = data.video_url.strip()
    if not video_url:
        raise HTTPException(status_code=400, detail="Please provide a YouTube URL.")

    try:
        print(f"Download request received: URL={data.video_url}, Format={data.format}, Quality={data.quality}")
        ydl_opts = {
            "format": "bestvideo+bestaudio/best",
            "outtmpl": os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s"),
            "merge_output_format": data.format,
            "cookiefile": COOKIES_PATH,
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
async def clip_video( ClipRequest = Body(...)):
    video_url = data.video_url.strip()
    start_time = data.start_time.strip()
    end_time = data.end_time.strip()
    if not video_url or not start_time or not end_time:
        raise HTTPException(status_code=400, detail="Please provide a YouTube URL, start time, and end time.")

    try:
        print(f"Clip request received: URL={data.video_url} | {start_time}-{end_time}")
        temp_filename = os.path.join(DOWNLOADS_DIR, "temp_for_clip.mp4")
        ydl_opts = {
            "format": "bestvideo+bestaudio/best",
            "outtmpl": temp_filename,
            "merge_output_format": data.format,
            "noplaylist": True,
            "cookiefile": COOKIES_PATH,
        }
        with YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(video_url, download=True)
            video_title = info_dict.get("title", "clip")
        
        safe_title = "".join(c for c in video_title if c.isalnum() or c in " .-_").rstrip()
        clip_filename = f"{safe_title}.clip.mp4"
        clip_filepath = os.path.join(DOWNLOADS_DIR, clip_filename)

        ffmpeg_cmd = ["ffmpeg", "-y", "-i", temp_filename, "-ss", start_time, "-to", end_time, "-c", "copy", clip_filepath]
        result = subprocess.run(ffmpeg_cmd, check=True, capture_output=True, text=True)
        
        if result.returncode != 0 or not os.path.exists(clip_filepath):
            raise Exception(f"FFmpeg failed to create the clip. Stderr: {result.stderr}")

        os.remove(temp_filename)
        
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
