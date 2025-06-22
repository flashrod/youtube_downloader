// src/components/DownloaderForm.jsx
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import DownloadIcon from "@mui/icons-material/Download";

const formats = [
  { value: "mp4", label: "MP4 (Video)" },
  { value: "mp3", label: "MP3 (Audio)" },
];

export default function DownloaderForm() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("mp4");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadLink, setDownloadLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDownloadLink("");
    if (!url.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }
    setLoading(true);
    try {
      // Replace with your backend endpoint
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format }),
      });

      if (!response.ok) {
        throw new Error("Failed to process the request.");
      }
      const data = await response.json();
      if (data && data.downloadUrl) {
        setDownloadLink(data.downloadUrl);
      } else {
        setError("No downloadable link received.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="YouTube URL"
          variant="outlined"
          fullWidth
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          autoFocus
        />
        <TextField
          select
          label="Format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          fullWidth
        >
          {formats.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<DownloadIcon />}
          disabled={loading}
          sx={{ fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Download"}
        </Button>
      </Stack>
      <Box sx={{ mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {downloadLink && (
          <Alert severity="success">
            <a
              href={downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                color: "#1976d2",
                fontWeight: 600,
              }}
            >
              Click here to download your file
            </a>
          </Alert>
        )}
      </Box>
    </Box>
  );
}
// This component provides a form for users to input a YouTube URL and select a download format.