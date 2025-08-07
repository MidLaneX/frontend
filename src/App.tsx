import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from "@mui/material";
import Box from '@mui/material/Box'
import { Navbar, Sidebar } from "@/components/layout";
import WelcomePage from "@/pages/WelcomePage";
import Dashboard from "@/pages/Dashboard";
import Project from "@/pages/Project";
import LandingPage from "@/pages/LandingPage";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { theme } from "@/config/theme";
import "./App.css";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        Loading...
      </Box>
    );
  }

  // If not authenticated, show only landing page
  // if (!isAuthenticated) {
  //   return (
  //     <Routes>
  //       <Route path="/landing" element={<LandingPage />} />
  //       <Route path="*" element={<Navigate to="/landing" replace />} />
  //     </Routes>
  //   );
  // }

  // Authenticated layout – now WITHOUT ProtectedRoute
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          position: "fixed",
          top: "68px", // below navbar
          left: "280px", // after sidebar
          width: "calc(100vw - 280px)",
          height: "calc(100vh - 68px)",
          bgcolor: "background.default",
          overflow: "auto",
          padding: 0,
          margin: 0,
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects/:projectId" element={<Project />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
