import os
import glob
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from yt_dlp import YoutubeDL

# Setup downloads directory
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

class ClipRequest(BaseModel):
    video_url: str
    start_time: str  # e.g. "00:01:00"
    end_time: str    # e.g. "00:02:00"

@app.post("/api/download")
async def download_video(data: DownloadRequest):
    video_url = data.video_url.strip()
    if not video_url:
        raise HTTPException(status_code=400, detail="Please provide a YouTube URL.")

    try:
        print("Download requested for:", video_url)
        ydl_opts = {
            "format": "best",
            "outtmpl": os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s"),
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
async def clip_video(data: ClipRequest):
    video_url = data.video_url.strip()
    start_time = data.start_time.strip()
    end_time = data.end_time.strip()
    if not video_url or not start_time or not end_time:
        raise HTTPException(status_code=400, detail="Please provide a YouTube URL, start time, and end time.")

    try:
        print(f"Clip requested for: {video_url} | {start_time} - {end_time}")
        print("Files BEFORE yt-dlp:", os.listdir(DOWNLOADS_DIR))
        section_string = f"*{start_time}-{end_time}"
        ydl_opts = {
            "format": "best",
            "outtmpl": os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s"),
            "download_sections": [section_string]
        }
        print("yt-dlp options:", ydl_opts)
        with YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(video_url, download=True)
            print("yt-dlp info_dict:", info_dict)
            video_title = info_dict.get("title", "video")
            base_name = os.path.splitext(ydl.prepare_filename(info_dict))[0]
            time.sleep(2)  # Give ffmpeg a moment to finish writing files
            print("Files AFTER yt-dlp:", os.listdir(DOWNLOADS_DIR))
            # Try .clip.* first, fallback to .temp.* if needed
            clip_files = glob.glob(f"{base_name}.clip.*")
            if not clip_files:
                print("No .clip. file found, trying .temp.*")
                clip_files = glob.glob(f"{base_name}.temp.*")
            print("Clip files found:", clip_files)
            clip_filename = os.path.basename(clip_files[0]) if clip_files else None

        if not clip_filename:
            raise HTTPException(
                status_code=500,
                detail="Clipped file was not created. Check FFmpeg installation, yt-dlp version, and section range."
            )

        return {
            "message": "Clipped video downloaded successfully!",
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