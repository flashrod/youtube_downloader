# YouTube Downloader 🎬

A modern, full-stack YouTube downloader web app. Download full videos or audio, or clip segments, with a beautiful React + Vite frontend and a FastAPI backend powered by `yt-dlp`.

---

## Features

- 🎥 Download YouTube videos in multiple formats (MP4, MP3, WebM)
- 🎵 Extract audio only
- ✂️ Clip specific segments by start/end time
- 📺 Choose video quality (1080p, 720p, 480p, 360p)
- ⚡ Fast, responsive UI with dark mode support
- 🪄 Modern design with Tailwind CSS and Radix UI
- 🔒 Safe download links, no ads

---

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Radix UI, Lucide Icons
- **Backend:** FastAPI, yt-dlp, Uvicorn, Python 3.8+
- **Other:** CORS, REST API, Docker-ready (optional)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/flashrod/youtube_downloader.git
cd youtube_downloader
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

- The backend will run at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

- The frontend will run at `http://localhost:5173`

---

## Usage

1. Open the frontend in your browser.
2. Paste a YouTube URL.
3. Choose format (MP4, MP3, WebM) and quality.
4. (Optional) Switch to "Clip Video" to select start/end times.
5. Click **Download** or **Clip Video**.
6. When ready, click the download link to save your file.

---

## API Endpoints

- `POST /api/download` — Download full video/audio
- `POST /api/clip` — Download a specific segment
- `GET /api/download-file/{filename}` — Download the processed file

---

## Project Structure

```
youtube_downloader/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── downloads/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── db.sqlite3
└── README.md
```

---

## Customization

- **Dark Mode:** Fully supported, auto-detects system theme.
- **Quality/Format:** Easily extendable in the frontend.
- **Backend:** Uses `yt-dlp` for best compatibility.

---

## Troubleshooting

- Make sure both backend and frontend are running.
- If you get CORS errors, check backend terminal for logs.
- For high-res downloads, some videos may not be available due to YouTube restrictions.

---

## License

MIT

---

## Credits

- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Feel free to copy this into your `README.md`. Let me know if you want to add Docker instructions or deployment info!
