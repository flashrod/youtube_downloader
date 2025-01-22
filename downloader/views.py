from django.shortcuts import render
from django.http import HttpResponse
from yt_dlp import YoutubeDL
import os

def home(request):
    return render(request, 'downloader/home.html')

def download_video(request):
    if request.method == 'POST':
        video_url = request.POST.get('video_url', '').strip()

        if not video_url:
            return render(request, 'downloader/home.html', {'error': 'Please provide a YouTube URL.'})

        try:
            ydl_opts = {
                'format': 'best',
                'outtmpl': 'downloads/%(title)s.%(ext)s',
            }
            with YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(video_url, download=True)
                video_title = info_dict.get('title', 'video')
                video_filename = ydl.prepare_filename(info_dict)

            return HttpResponse(f"Downloaded: {video_title} - File saved as: {video_filename}")

        except Exception as e:
            return render(request, 'downloader/home.html', {'error': f"An error occurred: {str(e)}"})

    return render(request, 'downloader/home.html')