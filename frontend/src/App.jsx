// src/App.jsx
import React, { useState } from "react";
import {
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import DownloadIcon from "@mui/icons-material/Download";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#ff1744",
    },
  },
});

const formats = [
  { value: "mp4", label: "MP4 (Video)" },
  { value: "mp3", label: "MP3 (Audio)" },
];

function App() {
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
      // Replace this with your actual backend API endpoint
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ minHeight: "100vh", py: 6 }}>
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow: 3,
            p: 4,
            mt: 6,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            YouTube Downloader
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ mb: 3, color: "text.secondary" }}
          >
            Paste a YouTube URL below and choose your format.
          </Typography>
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
          </Box>
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
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }}
                >
                  Click here to download your file
                </a>
              </Alert>
            )}
          </Box>
        </Box>
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 6, color: "text.secondary" }}
        >
          © 2025 YouTube Downloader. All rights reserved.
        </Typography>
      </Container>
    </ThemeProvider>
  );
}

export default App;
