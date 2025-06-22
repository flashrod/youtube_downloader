import os
import subprocess
from yt_dlp import YoutubeDL

# ---- CONFIGURE THESE ----
VIDEO_URL = "https://www.youtube.com/watch?v=aqz-KE-bpKQ"  # Example: Big Buck Bunny (public domain)
START_TIME = "00:01:00"
END_TIME = "00:01:10"
DOWNLOADS_DIR = "downloads"
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

# ---- yt-dlp: Download the full video (mp4) to a temp file ----
ydl_opts = {
    "format": "bestvideo+bestaudio/best",
    "outtmpl": os.path.join(DOWNLOADS_DIR, "temp_for_clip.%(ext)s"),
    "merge_output_format": "mp4",
    "noplaylist": True,
}

def get_downloaded_filename(info_dict):
    # Find the actual file written by yt-dlp (should be DOWNLOADS_DIR/temp_for_clip.mp4)
    filename = info_dict.get("_filename")
    if filename:
        return filename
    ext = info_dict.get("ext", "mp4")
    return os.path.join(DOWNLOADS_DIR, f"temp_for_clip.{ext}")

def run():
    print("\n--- Downloading to temp file with yt-dlp ---")
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(VIDEO_URL, download=True)
        video_filename = get_downloaded_filename(info)
    print(f"Downloaded (temp): {video_filename}")

    # ---- Get final clip filename based on video title ----
    video_title = info.get("title", "clip")
    safe_title = "".join(c for c in video_title if c.isalnum() or c in " .-_").rstrip()
    clip_filename = os.path.join(DOWNLOADS_DIR, f"{safe_title}.clip.mp4")

    # ---- Clip with ffmpeg ----
    print(f"\n--- Clipping with ffmpeg to: {clip_filename} ---")
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", video_filename,
        "-ss", START_TIME,
        "-to", END_TIME,
        "-c", "copy",
        clip_filename
    ]
    print(" ".join(ffmpeg_cmd))
    result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    print("\nFFmpeg stdout:\n", result.stdout)
    print("\nFFmpeg stderr:\n", result.stderr)
    if result.returncode != 0:
        print("ERROR: FFmpeg failed.")
        return
    elif not os.path.exists(clip_filename):
        print("ERROR: Clip file was not created!")
        return
    else:
        print(f"\nSuccess! Clipped file: {clip_filename} (check your downloads folder)")

    # ---- Remove the temp full video file ----
    try:
        os.remove(video_filename)
        print(f"\nDeleted temp file: {video_filename}")
    except Exception as e:
        print(f"\nWarning: Could not delete temp file: {e}")

if __name__ == "__main__":
    run()