// src/App.jsx
import React, { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Switch,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DownloaderForm from "./DownloaderForm";

// Import Google Fonts via CDN in index.html for "Poppins" and "Space Grotesk"
// Example: <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />

export default function App() {
  const [mode, setMode] = useState("light");

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: "#FF416C" },
      secondary: { main: "#1FA2FF" },
      background: {
        default: mode === "light" ? "#f8fafc" : "#181a1b",
        paper: mode === "light" ? "rgba(255,255,255,0.88)" : "rgba(30,32,34,0.85)",
      },
      text: {
        primary: mode === "light" ? "#232946" : "#f8fafc",
        secondary: mode === "light" ? "#636e72" : "#b2bec3",
      },
    },
    typography: {
      fontFamily: "'Poppins', 'Space Grotesk', 'Inter', 'Roboto', Arial, sans-serif",
      fontWeightBold: 700,
      h4: {
        fontFamily: "'Space Grotesk', 'Poppins', sans-serif",
        fontWeight: 800,
        letterSpacing: 1,
      },
      h5: {
        fontFamily: "'Space Grotesk', 'Poppins', sans-serif",
        fontWeight: 700,
      },
      subtitle1: {
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 400,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(16px)",
            borderRadius: 28,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Landing Page Gradient Background */}
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: mode === "light"
            ? "linear-gradient(135deg, #1FA2FF 0%, #12D8FA 50%, #FF416C 100%)"
            : "linear-gradient(135deg, #232946 0%, #1FA2FF 60%, #FF416C 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: mode === "light"
              ? "radial-gradient(circle at 70% 10%, rgba(255,255,255,0.18) 0%, transparent 80%)"
              : "radial-gradient(circle at 70% 10%, rgba(31,38,135,0.18) 0%, transparent 80%)",
            zIndex: 1,
          },
        }}
      />
      <Container maxWidth="sm" sx={{ minHeight: "100vh", py: 7, position: "relative" }}>
        {/* Header Bar */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: 1,
              color: "primary.main",
              userSelect: "none",
              textShadow: "0 2px 12px rgba(31,38,135,0.07)",
              fontFamily: "'Space Grotesk', 'Poppins', sans-serif",
            }}
          >
            YT<span style={{ color: "#1FA2FF" }}>Downloader</span>
          </Typography>
          <Tooltip title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}>
            <IconButton
              color="primary"
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
              size="large"
              sx={{ ml: 1 }}
            >
              {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              <Switch checked={mode === "dark"} sx={{ ml: 1 }} />
            </IconButton>
          </Tooltip>
        </Box>
        {/* Hero Section */}
        <Box
          sx={{
            mb: 4,
            textAlign: "center",
            px: { xs: 1, sm: 3 },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 1.5,
              fontWeight: 700,
              color: "text.primary",
              fontFamily: "'Space Grotesk', 'Poppins', sans-serif",
              letterSpacing: 0.5,
            }}
          >
            Download YouTube Videos & Audio Instantly
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "text.secondary",
              fontSize: "1.08rem",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 400,
            }}
          >
            Paste a YouTube link, pick your format, and get your download in seconds. Modern, secure, and totally free.
          </Typography>
        </Box>
        <DownloaderForm />
        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 7,
            color: "text.secondary",
            opacity: 0.85,
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: 0.2,
          }}
        >
          © 2025 The Ultimate YT Downloader. Built with ❤️ and Material UI.
        </Typography>
      </Container>
    </ThemeProvider>
  );
}
