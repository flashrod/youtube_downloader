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

export default function App() {
  const [mode, setMode] = useState("light");

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: "#4a90e2" },
      secondary: { main: "#d81b60" },
      background: {
        default: mode === "light" ? "#f0f4f8" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
      text: {
        primary: mode === "light" ? "#212121" : "#e0e0e0",
        secondary: mode === "light" ? "#616161" : "#bdbdbd",
      },
    },
    typography: {
      fontFamily: "'Montserrat', 'Roboto', 'Arial', sans-serif",
      fontWeightBold: 700,
      h4: {
        fontWeight: 900,
        letterSpacing: 2,
      },
      subtitle1: {
        fontWeight: 500,
        letterSpacing: 0.5,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: mode === "light"
              ? "0 10px 30px rgba(74, 144, 226, 0.3)"
              : "0 10px 30px rgba(216, 27, 96, 0.5)",
            backdropFilter: "blur(15px)",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Background Gradient */}
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: mode === "light"
            ? "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
            : "linear-gradient(135deg, #1e1e1e 0%, #4a148c 100%)",
        }}
      />
      <Container maxWidth="sm" sx={{ minHeight: "100vh", py: 8, position: "relative" }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "primary.main",
              userSelect: "none",
              textShadow: mode === "light" ? "2px 2px 6px #a8edea" : "2px 2px 6px #d81b60",
            }}
          >
            YouTube Downloader
          </Typography>
          <Tooltip title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}>
            <IconButton
              color="primary"
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
              size="large"
            >
              {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              <Switch checked={mode === "dark"} sx={{ ml: 1 }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{ mb: 5, color: "text.secondary", fontWeight: 600 }}
        >
          Paste your YouTube video URL below, select format, and download instantly.
        </Typography>
        <DownloaderForm />
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 8, color: "text.secondary" }}
        >
          © 2025 YouTube Downloader. Crafted with ❤️ and Montserrat.
        </Typography>
      </Container>
    </ThemeProvider>
  );
}
