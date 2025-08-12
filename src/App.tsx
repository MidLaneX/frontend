import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from "@mui/material";
import Box from '@mui/material/Box'
import { Navbar, Sidebar } from "@/components/layout";
import WelcomePage from "@/pages/WelcomePage";
import Dashboard from "@/pages/Dashboard";
import Project from "@/pages/Project";
import LandingPage from "@/pages/LandingPage";
import AccountSettings from "@/pages/AccountSettings";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { theme } from "@/config/theme";
import "./App.css";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Initialize token refresh monitoring
  useTokenRefresh();

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
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    );
  }

  // If authenticated, show main app layout
  return (
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects/:projectId" 
            element={
              <ProtectedRoute>
                <Project />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account/settings" 
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            } 
          />
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

export default App
