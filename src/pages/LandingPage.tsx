import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  Assignment,
  Group,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import type { SignupData } from '../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // Redirect to dashboard when authenticated
  useEffect(() => {
    console.log("Authentication state changed:", isAuthenticated);
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(''); 

    try {
      await login(loginData.email, loginData.password);
      setSuccess('Login successful! Redirecting...');
      
    } catch (err: any) {
      // Show exact error message from backend
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate email
    if (!signupData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Validate password length
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userData: SignupData = {
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone || undefined,
      };

      await signup(userData);
      setSuccess('Account created successfully! Redirecting...');
    } catch (err: any) {
      // Show exact error message from backend
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <DashboardIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Interactive Dashboard',
      description: 'Get a comprehensive overview of all your projects and tasks in one place.',
    },
    {
      icon: <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Task Management',
      description: 'Create, assign, and track tasks with our intuitive Kanban board interface.',
    },
    {
      icon: <Group sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team members and track everyone\'s progress.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Analytics & Reports',
      description: 'Gain insights into your project performance with detailed analytics.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                color: 'white',
                mb: 3,
              }}
            >
              Project Management
              <Typography
                component="span"
                variant="h2"
                sx={{
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 'normal',
                }}
              >
                Made Simple
              </Typography>
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Streamline your workflow, collaborate with your team, and deliver projects on time with our intuitive project management platform.
            </Typography>

            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
                onClick={() => setTabValue(1)}
              >
                Get Started
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1, maxWidth: 450 }}>
            <Paper
              elevation={8}
              sx={{
                p: 4,
                borderRadius: 3,
                width: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccountCircle sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Welcome Back
                </Typography>
              </Box>

              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ mb: 2 }}
              >
                <Tab label="Login" />
                <Tab label="Sign Up" />
              </Tabs>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <TabPanel value={tabValue} index={0}>
                <Box component="form" onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    variant="outlined"
                    margin="normal"
                    required
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    required
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Login'}
                  </Button>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box component="form" onSubmit={handleSignup}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    variant="outlined"
                    margin="normal"
                    required
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    helperText="Enter a valid email address"
                  />
                  <TextField
                    fullWidth
                    label="Phone (optional)"
                    variant="outlined"
                    margin="normal"
                    value={signupData.phone}
                    onChange={(e) =>
                      setSignupData({ ...signupData, phone: e.target.value })
                    }
                    helperText="Phone number (optional)"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    required
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    helperText="Minimum 6 characters"
                  />
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    required
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value,
                      })
                    }
                    error={signupData.confirmPassword !== '' && signupData.password !== signupData.confirmPassword}
                    helperText={
                      signupData.confirmPassword !== '' && signupData.password !== signupData.confirmPassword
                        ? "Passwords don't match"
                        : "Re-enter your password"
                    }
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Create Account'}
                  </Button>
                </Box>
              </TabPanel>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ color: 'white', mb: 6, fontWeight: 'bold' }}
        >
          Why Choose Our Platform?
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 4,
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                textAlign: 'center',
                p: 2,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;