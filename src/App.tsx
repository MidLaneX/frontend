import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Navbar from './components/Navbar.tsx'
import Sidebar from './components/Sidebar.tsx'
import WelcomePage from './pages/WelcomePage.tsx'
import Dashboard from './pages/Dashboard.tsx'
import ProjectPage from './components/Project.tsx'
import './App.css'

const theme = createTheme({
  palette: {
    background: {
      default: '#FAFBFC'
    }
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
  }
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex' }}>
          <Navbar />
          <Sidebar />
            <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              bgcolor: 'background.default',
              minHeight: '100vh',
              pt: '64px', // Account for fixed navbar
              pl: 2,
              pr: 2
            }}
          >
            <Routes>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects/:projectId" element={<ProjectPage />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
