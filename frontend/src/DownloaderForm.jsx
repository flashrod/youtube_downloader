// src/DownloaderForm.jsx
import React, { useState } from "react";
import {
  Paper,
  Box,
  Stack,
  TextField,
  Button,
  Alert,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import VideoFileIcon from "@mui/icons-material/VideoFile";

export default function DownloaderForm() {
  const [videoUrl, setVideoUrl] = useState("");
  const [mode, setMode] = useState("download"); // 'download' or 'clip'
  const [startTime, setStartTime] = useState(dayjs().hour(0).minute(0).second(0));
  const [endTime, setEndTime] = useState(dayjs().hour(0).minute(1).second(0));
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatTimeForAPI = (timeValue) => {
    if (!timeValue) return "00:00:00";
    return timeValue.format("HH:mm:ss");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError("");
    setLoading(true);
    setCopied(false);

    let endpoint = "";
    let body = {};

    if (mode === "download") {
      endpoint = "http://localhost:8000/api/download";
      body = { video_url: videoUrl };
    } else {
      endpoint = "http://localhost:8000/api/clip";
      body = {
        video_url: videoUrl,
        start_time: formatTimeForAPI(startTime),
        end_time: formatTimeForAPI(endTime),
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 600,
          mx: "auto",
          background: (theme) => theme.palette.background.paper,
          borderRadius: 4,
          boxShadow: (theme) =>
            theme.palette.mode === "light"
              ? "0 8px 24px rgba(74, 144, 226, 0.2)"
              : "0 8px 24px rgba(216, 27, 96, 0.4)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* URL Input */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  color: "text.secondary",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                Enter YouTube URL
              </Typography>
              <TextField
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                required
                fullWidth
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              />
            </Box>

            {/* Mode Selection */}
            <Box>
              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    mb: 1,
                  }}
                >
                  Download Mode
                </FormLabel>
                <RadioGroup
                  row
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  sx={{ gap: 2 }}
                >
                  <FormControlLabel
                    value="download"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <VideoFileIcon fontSize="small" />
                        <Typography sx={{ fontWeight: 600 }}>Full Video</Typography>
                      </Box>
                    }
                    sx={{
                      border: mode === "download" ? "2px solid" : "2px solid transparent",
                      borderColor: mode === "download" ? "primary.main" : "transparent",
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      m: 0,
                      transition: "all 0.3s ease",
                    }}
                  />
                  <FormControlLabel
                    value="clip"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ContentCutIcon fontSize="small" />
                        <Typography sx={{ fontWeight: 600 }}>Clip</Typography>
                      </Box>
                    }
                    sx={{
                      border: mode === "clip" ? "2px solid" : "2px solid transparent",
                      borderColor: mode === "clip" ? "primary.main" : "transparent",
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      m: 0,
                      transition: "all 0.3s ease",
                    }}
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Clip Time Pickers */}
            {mode === "clip" && (
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    color: "text.secondary",
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  Clip Duration (HH:MM:SS)
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <TimePicker
                      label="Start Time"
                      value={startTime}
                      onChange={(newValue) => setStartTime(newValue)}
                      views={["hours", "minutes", "seconds"]}
                      format="HH:mm:ss"
                      ampm={false}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TimePicker
                      label="End Time"
                      value={endTime}
                      onChange={(newValue) => setEndTime(newValue)}
                      views={["hours", "minutes", "seconds"]}
                      format="HH:mm:ss"
                      ampm={false}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                    display: "block",
                    textAlign: "center",
                  }}
                >
                  Click on the time fields to open the time picker dials
                </Typography>
              </Box>
            )}

            {/* Download Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={mode === "download" ? <DownloadIcon /> : <ContentCutIcon />}
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 3,
                fontSize: "1.1rem",
              }}
            >
              {loading
                ? "Processing..."
                : mode === "download"
                ? "Download Full Video"
                : "Download Clip"}
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
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {mode === "download" ? "Fetching video data..." : "Creating clip..."}
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
                borderRadius: 3,
                fontWeight: 500,
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
                borderRadius: 3,
                fontWeight: 500,
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
              <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
                Success! {mode === "download" ? "Video" : "Clip"} Ready
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Title: {result.title || "Video"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                File: {result.filename}
              </Typography>
              {mode === "clip" && result.start_time && result.end_time && (
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                  Clipped: {result.start_time} - {result.end_time}
                </Typography>
              )}
              {result.download_url && (
                <Button
                  href={result.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Open Download
                </Button>
              )}
            </Alert>
          )}
        </Box>
      </Paper>
    </LocalizationProvider>
  );
}
