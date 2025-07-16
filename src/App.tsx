import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from "@mui/material";
import Box from '@mui/material/Box'
import { Navbar, Sidebar } from "@/components/layout";
import WelcomePage from "@/pages/WelcomePage";
import Dashboard from "@/pages/Dashboard";
import Project from "@/pages/Project";
import { theme } from "@/config/theme";
import "./App.css";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          <Navbar />
          <Sidebar />
          <Box
            component="main"
            sx={{
              position: "fixed",
              top: "68px", // Start below navbar
              left: "280px", // Start after sidebar
              width: "calc(100vw - 280px)", // Full remaining width
              height: "calc(100vh - 68px)", // Full remaining height
              bgcolor: "background.default",
              overflow: "auto",
              padding: 0,
              margin: 0,
            }}
          >
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects/:projectId" element={<Project />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App
