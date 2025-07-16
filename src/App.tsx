import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Navbar from "./components/Navbar.tsx";
import WelcomePage from "./pages/WelcomePage.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Project from "./pages/Project.tsx";
import Sidebar from "./components/Sidebar.tsx";
import "./App.css";

const theme = createTheme({
  palette: {
    background: {
      default: "#FAFBFC",
    },
    primary: {
      main: "#0052CC",
    },
    secondary: {
      main: "#36B37E",
    },
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
});

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
