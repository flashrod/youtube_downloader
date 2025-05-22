Sure! Here’s the full README.md in Markdown format:

# YouTube Downloader 🎥⬇️

A simple Python-based CLI tool to download YouTube videos or extract audio using the `pytube` library.

## Features

- Download videos in multiple resolutions (e.g., 720p, 1080p)
- Extract audio in MP4 format
- User-friendly command-line prompts
- Lightweight and easy to use

## Requirements

- Python 3.7+
- `pytube`

## Installation

1. Clone the repository:

```bash
git clone https://github.com/flashrod/youtube_downloader.git
cd youtube_downloader

	2.	Install dependencies:

pip install pytube

Usage

Run the script using Python:

python downloader.py

Then follow the prompts to:
	•	Enter the YouTube video URL
	•	Choose whether to download the full video or audio only
	•	Select the desired resolution (for video)

Example

Enter the YouTube URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Choose download type:
1. Video
2. Audio
> 1
Select resolution:
1. 360p
2. 720p
3. 1080p
> 2
Downloading...
Done!

Notes
	•	Downloaded files are saved in the same directory as the script.
	•	Some high-resolution videos may not be available depending on the source.
	•	Make sure the video is public and not age-restricted.

License

This project is licensed under the MIT License.
