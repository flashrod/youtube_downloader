// src/DownloaderForm.jsx
import React, { useState } from "react";
import {
  Paper,
  Box,
  Stack,
  TextField,
  Button,
  MenuItem,
  Alert,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";

const FORMATS = [
  { value: "mp4", label: "MP4", description: "Video format" },
  { value: "mp3", label: "MP3", description: "Audio only" },
];

export default function DownloaderForm() {
  const [videoUrl, setVideoUrl] = useState("");
  const [format, setFormat] = useState("mp4");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    setResult(null);
    setError("");
    setLoading(true);
    setCopied(false);

    try {
      const response = await fetch("http://localhost:8000/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl, format }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || "Download failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (result?.download_url) {
      navigator.clipboard.writeText(result.download_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        maxWidth: 600,
        mx: "auto",
        background: (theme) => theme.palette.background.paper,
      }}
    >
      <form onSubmit={handleDownload}>
        <Stack spacing={3}>
          {/* URL Input */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                color: "text.secondary",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              $ paste_youtube_url
            </Typography>
            <TextField
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              required
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.9rem",
                },
              }}
            />
          </Box>

          {/* Format Selection */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                color: "text.secondary",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              $ select_format
            </Typography>
            <Stack direction="row" spacing={1}>
              {FORMATS.map((fmt) => (
                <Chip
                  key={fmt.value}
                  label={`${fmt.label} - ${fmt.description}`}
                  onClick={() => setFormat(fmt.value)}
                  color={format === fmt.value ? "primary" : "default"}
                  variant={format === fmt.value ? "filled" : "outlined"}
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.8rem",
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Download Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            disabled={loading}
            sx={{
              py: 1.5,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            {loading ? "Processing..." : `Download ${format.toUpperCase()}`}
          </Button>

          {/* Loading Progress */}
          {loading && (
            <Box>
              <LinearProgress sx={{ borderRadius: 1 }} />
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: "center",
                }}
              >
                Fetching video data...
              </Typography>
            </Box>
          )}
        </Stack>
      </form>

      {/* Results */}
      <Box sx={{ mt: 3 }}>
        {/* Error */}
        {error && (
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              borderRadius: 2,
            }}
          >
            Error: {error}
          </Alert>
        )}

        {/* Success */}
        {result && (
          <Alert
            severity="success"
            icon={<CheckIcon />}
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              borderRadius: 2,
            }}
            action={
              result.download_url && (
                <Tooltip title={copied ? "Copied!" : "Copy link"}>
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={handleCopy}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            }
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Download ready: {result.title || "Video"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              File: {result.filename}
            </Typography>
            {result.download_url && (
              <Button
                href={result.download_url}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                sx={{
                  mt: 1,
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "none",
                }}
              >
                Open Download
              </Button>
            )}
          </Alert>
        )}
      </Box>
    </Paper>
  );
}
