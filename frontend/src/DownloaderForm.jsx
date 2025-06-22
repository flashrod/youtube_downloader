import React, { useState } from "react";
import {
  Paper,
  Box,
  Stack,
  TextField,
  Button,
  MenuItem,
  Alert,
  Slide,
  Skeleton,
  Typography,
  IconButton,
  Tooltip,
  InputAdornment,
  Fade,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const FORMATS = [
  { value: "mp4", label: "MP4 (Video)" },
  { value: "mp3", label: "MP3 (Audio)" },
];

function getYoutubeVideoId(url) {
  try {
    const regExp =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

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
      if (!response.ok) throw new Error(data.detail || data.error || "Unknown error");
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
      setTimeout(() => setCopied(false), 1800);
    }
  };

  // For video preview
  const videoId = getYoutubeVideoId(videoUrl);
  const videoThumb = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (
    <Paper
      elevation={4}
      sx={{
        p: { xs: 2, sm: 4 },
        borderRadius: 5,
        maxWidth: 520,
        mx: "auto",
        background: (theme) =>
          theme.palette.mode === "light"
            ? "rgba(255,255,255,0.85)"
            : "rgba(30,32,34,0.92)",
        boxShadow:
          "0 8px 32px 0 rgba(31, 38, 135, 0.25), 0 1.5px 4px 0 rgba(0,0,0,0.04)",
        backdropFilter: "blur(12px)",
      }}
    >
      <form onSubmit={handleDownload} autoComplete="off">
        <Stack spacing={3}>
          <TextField
            label="YouTube Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste a YouTube link"
            required
            autoFocus
            variant="outlined"
            fullWidth
            InputProps={{
              endAdornment: videoId && (
                <InputAdornment position="end">
                  <Tooltip title="Preview video">
                    <IconButton
                      href={`https://youtu.be/${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      edge="end"
                      size="small"
                      color="secondary"
                    >
                      <PlayCircleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            fullWidth
            variant="outlined"
          >
            {FORMATS.map((option) => (
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
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              py: 1.2,
              fontSize: "1.1rem",
              borderRadius: 3,
              boxShadow: "0 2px 8px 0 rgba(229,57,53,0.08)",
              transition: "transform 0.15s cubic-bezier(.4,2,.6,1)",
              "&:active": { transform: "scale(0.97)" },
            }}
          >
            {loading ? "Processing..." : "Download"}
          </Button>
        </Stack>
      </form>
      <Box sx={{ mt: 3 }}>
        {/* Video Preview */}
        <Fade in={!!videoId && !result && !loading}>
          <Box
            sx={{
              display: videoId && !result && !loading ? "flex" : "none",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 1,
              borderRadius: 2,
              background: (theme) =>
                theme.palette.mode === "light"
                  ? "rgba(245,245,245,0.7)"
                  : "rgba(40,40,40,0.7)",
            }}
          >
            <img
              src={videoThumb}
              alt="Video thumbnail"
              style={{
                width: 80,
                height: 56,
                borderRadius: 8,
                objectFit: "cover",
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Video preview available
            </Typography>
          </Box>
        </Fade>

        {/* Loading Skeleton */}
        {loading && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" height={32} />
            <Skeleton variant="rectangular" height={32} width="80%" />
          </Stack>
        )}

        {/* Error Alert */}
        <Slide direction="down" in={!!error}>
          <Box>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Slide>

        {/* Success Result */}
        <Slide direction="up" in={!!result}>
          <Box>
            {result && (
              <Alert
                severity="success"
                iconMapping={{
                  success: <CheckCircleIcon fontSize="inherit" />,
                }}
                sx={{
                  mt: 2,
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  alignItems: "center",
                  borderRadius: 3,
                  background: (theme) =>
                    theme.palette.mode === "light"
                      ? "rgba(232,255,241,0.96)"
                      : "rgba(30,60,40,0.93)",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {result.title || "Download ready!"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Saved as:</strong> {result.filename}
                    </Typography>
                    {result.download_url && (
                      <Button
                        href={result.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={<DownloadIcon />}
                        sx={{
                          mt: 0.5,
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: "none",
                        }}
                      >
                        Download Now
                      </Button>
                    )}
                  </Box>
                  {result.download_url && (
                    <Tooltip title={copied ? "Copied!" : "Copy download link"}>
                      <IconButton
                        onClick={handleCopy}
                        color={copied ? "success" : "primary"}
                        sx={{ ml: 1 }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Alert>
            )}
          </Box>
        </Slide>
      </Box>
    </Paper>
  );
}
