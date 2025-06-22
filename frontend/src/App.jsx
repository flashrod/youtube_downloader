// src/App.jsx
import React, { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, IconButton, Tooltip, Switch } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DownloaderForm from "./DownloaderForm";

export default function App() {
  const [mode, setMode] = useState("light");

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: "#e53935" },
      secondary: { main: "#1976d2" },
      background: {
        default: mode === "light" ? "#f9fafb" : "#181a1b",
        paper: mode === "light" ? "rgba(255,255,255,0.8)" : "rgba(30,32,34,0.85)",
      },
    },
    typography: {
      fontFamily: "Inter, Roboto, Arial, sans-serif",
      fontWeightBold: 700,
      h4: { fontWeight: 800 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(12px)",
            borderRadius: 24,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ minHeight: "100vh", py: 7 }}>
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
            }}
          >
            YouTube Downloader
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
        <Typography
          align="center"
          variant="subtitle1"
          sx={{ mb: 4, color: "text.secondary" }}
        >
          Download any YouTube video or audio instantly. Paste a link, choose format, and go!
        </Typography>
        <DownloaderForm />
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 7, color: "text.secondary", opacity: 0.8 }}
        >
          © 2025 The Ultimate YT Downloader. Built with ❤️ and Material UI.
        </Typography>
      </Container>
    </ThemeProvider>
  );
}
