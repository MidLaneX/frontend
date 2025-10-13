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
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  Assignment,
  Group,
  TrendingUp,
  CheckCircle,
  Speed,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import type { SignupData } from '../context/AuthContext';
import type { SocialLoginRequest } from '../api/endpoints/auth';
import { GoogleLoginButton } from '../components/auth';

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
  const { login, signup, socialLogin, isAuthenticated } = useAuth();
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

  const handleSocialLogin = async (
    provider: 'google',
    accessToken: string,
    email: string,
    name: string,
    profilePicture?: string
  ) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const socialLoginData: SocialLoginRequest = {
        provider,
        accessToken,
        email,
        name,
        profilePicture,
      };

      await socialLogin(socialLoginData);
      setSuccess('Google login successful! Redirecting...');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Google login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialError = (error: string) => {
    setError(error);
  };

  const features = [
    {
      icon: <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: 'Project Dashboard',
      description: 'Track progress across all your projects with comprehensive overview dashboards.',
    },
    {
      icon: <Assignment sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: 'Task Management',
      description: 'Create, assign, and organize tasks with our intuitive Kanban boards.',
    },
    {
      icon: <Group sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with real-time updates and team communication.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: 'Progress Analytics',
      description: 'Get insights into project performance with detailed reports and analytics.',
    },
    {
      icon: <CheckCircle sx={{ fontSize: 32, color: 'success.main' }} />,
      title: 'Quality Assurance',
      description: 'Ensure project quality with built-in review processes and checkpoints.',
    },
    {
      icon: <Speed sx={{ fontSize: 32, color: 'warning.main' }} />,
      title: 'Agile Workflows',
      description: 'Implement agile methodologies with sprint planning and velocity tracking.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60vh',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
          zIndex: 0,
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DashboardIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" component="div" sx={{ 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}>
                ProjectFlow
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setTabValue(0)}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  border: '2px solid transparent',
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #1976d2, #9c27b0) border-box',
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => setTabValue(1)}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 30px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 12 }, flex: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: { xs: 'auto', md: '70vh' }
        }}>
          {/* Left Side - Content */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Stack spacing={4} sx={{ maxWidth: { xs: '100%', md: '600px' } }}>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    fontSize: '0.875rem',
                    mb: 2,
                  }}
                >
                  The Future of Team Collaboration
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    lineHeight: 1.1,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                    letterSpacing: '-0.02em',
                    mb: 2,
                  }}
                >
                  Transform Your{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'inherit',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-8px',
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                        borderRadius: '2px',
                      }
                    }}
                  >
                    Project Workflow
                  </Box>
                </Typography>
              </Box>
              
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  maxWidth: '500px'
                }}
              >
                Empower your team with intelligent project management tools. 
                Streamline workflows, boost productivity, and deliver exceptional results 
                with our cutting-edge platform.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setTabValue(1)}
                  sx={{ 
                    textTransform: 'none', 
                    px: 6, 
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 12px 48px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-3px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setTabValue(0)}
                  sx={{ 
                    textTransform: 'none', 
                    px: 6, 
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    borderRadius: '16px',
                    borderWidth: '2px',
                    '&:hover': {
                      borderWidth: '2px',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.2)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Watch Demo
                </Button>
              </Stack>

              {/* Trust indicators */}
              <Box sx={{ pt: 4 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mb: 2,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Trusted by 10,000+ teams worldwide
                </Typography>
                <Stack direction="row" spacing={3} sx={{ opacity: 0.7 }}>
                  <Chip 
                    label="⭐ 4.9/5 Rating" 
                    size="small" 
                    variant="outlined"
                    sx={{ borderRadius: '12px' }}
                  />
                  <Chip 
                    label="🚀 99.9% Uptime" 
                    size="small" 
                    variant="outlined"
                    sx={{ borderRadius: '12px' }}
                  />
                  <Chip 
                    label="🔒 SOC 2 Compliant" 
                    size="small" 
                    variant="outlined"
                    sx={{ borderRadius: '12px' }}
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Right Side - Auth Form */}
          <Box sx={{ flex: 1, maxWidth: 480, width: '100%' }}>
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: '24px',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '24px',
                  padding: '1px',
                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.3), rgba(156, 39, 176, 0.3))',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'subtract',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'subtract',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <AccountCircle sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" component="h2" sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    fontSize: '1.5rem',
                    lineHeight: 1.2,
                  }}>
                    {tabValue === 0 ? 'Welcome Back!' : 'Join ProjectFlow'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {tabValue === 0 ? 'Sign in to your account' : 'Create your free account'}
                  </Typography>
                </Box>
              </Box>

              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ 
                  mb: 4,
                  position: 'relative',
                  zIndex: 1,
                  '& .MuiTabs-indicator': {
                    background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                    height: 3,
                    borderRadius: '2px',
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2,
                    '&.Mui-selected': {
                      color: 'primary.main',
                    }
                  }
                }}
              >
                <Tab label="Sign In" />
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
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      }
                    }}
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
                    sx={{ 
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ 
                      py: 2, 
                      textTransform: 'none', 
                      fontWeight: 600, 
                      mb: 3,
                      borderRadius: '16px',
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        boxShadow: '0 12px 48px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.5) 0%, rgba(156, 39, 176, 0.5) 100%)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                  </Button>
                  
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      or continue with
                    </Typography>
                  </Divider>
                  
                  <Stack spacing={2}>
                    <GoogleLoginButton
                      onSuccess={(accessToken, email, name, profilePicture) =>
                        handleSocialLogin('google', accessToken, email, name, profilePicture)
                      }
                      onError={handleSocialError}
                      disabled={loading}
                    />
                  </Stack>
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
                    helperText="We'll use this for your account"
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      }
                    }}
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
                    helperText="For account recovery"
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      }
                    }}
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
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      }
                    }}
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
                    sx={{ 
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ 
                      py: 2, 
                      textTransform: 'none', 
                      fontWeight: 600, 
                      mb: 3,
                      borderRadius: '16px',
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        boxShadow: '0 12px 48px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.5) 0%, rgba(156, 39, 176, 0.5) 100%)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                  </Button>
                  
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      or sign up with
                    </Typography>
                  </Divider>
                  
                  <Stack spacing={2}>
                    <GoogleLoginButton
                      onSuccess={(accessToken, email, name, profilePicture) =>
                        handleSocialLogin('google', accessToken, email, name, profilePicture)
                      }
                      onError={handleSocialError}
                      disabled={loading}
                    />
                  </Stack>
                </Box>
              </TabPanel>
            </Paper>
          </Box>
        </Box>
      </Container>

      <Divider />

      {/* Features Section */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        py: { xs: 8, md: 12 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '4px',
          background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
          borderRadius: '2px',
        }
      }}>
        <Container maxWidth="lg">
          <Stack spacing={8}>
            <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
              <Typography
                variant="body1"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  fontSize: '0.875rem',
                  mb: 3,
                }}
              >
                Powerful Features
              </Typography>
              <Typography
                variant="h2"
                component="h2"
                sx={{ 
                  fontWeight: 700, 
                  color: 'text.primary', 
                  mb: 3,
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em'
                }}
              >
                Everything you need to{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  scale your business
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: '1.1rem'
                }}
              >
                Our comprehensive platform provides all the tools your team needs to collaborate 
                effectively and deliver exceptional results.
              </Typography>
            </Box>
            
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 4,
            }}>
              {features.map((feature, index) => (
                <Box key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      border: 'none',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                        transform: 'translateY(-8px)',
                        '& .feature-icon': {
                          transform: 'scale(1.1)',
                          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                        },
                        '&::before': {
                          opacity: 1,
                        }
                      },
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '20px',
                        padding: '1px',
                        background: `linear-gradient(135deg, 
                          ${index % 3 === 0 ? 'rgba(25, 118, 210, 0.3)' : 
                            index % 3 === 1 ? 'rgba(156, 39, 176, 0.3)' : 
                            'rgba(76, 175, 80, 0.3)'}, 
                          ${index % 3 === 0 ? 'rgba(156, 39, 176, 0.3)' : 
                            index % 3 === 1 ? 'rgba(76, 175, 80, 0.3)' : 
                            'rgba(25, 118, 210, 0.3)'})`,
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'subtract',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'subtract',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                      <Stack spacing={3}>
                        <Box 
                          className="feature-icon"
                          sx={{ 
                            width: 64,
                            height: 64,
                            borderRadius: '16px',
                            background: `linear-gradient(135deg, 
                              ${index % 3 === 0 ? '#1976d2' : 
                                index % 3 === 1 ? '#9c27b0' : 
                                '#4caf50'} 0%, 
                              ${index % 3 === 0 ? '#9c27b0' : 
                                index % 3 === 1 ? '#4caf50' : 
                                '#1976d2'} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(25, 118, 210, 0.2)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '& svg': {
                              color: 'white',
                              fontSize: 32,
                            }
                          }}
                        >
                          {React.cloneElement(feature.icon, {
                            sx: { color: 'white', fontSize: 32 }
                          })}
                        </Box>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          sx={{ 
                            fontWeight: 700, 
                            color: 'text.primary',
                            fontSize: '1.25rem',
                            lineHeight: 1.3,
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary', 
                            lineHeight: 1.7,
                            fontSize: '0.95rem'
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.06)',
          py: 6,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(156, 39, 176, 0.02) 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DashboardIcon sx={{ color: 'white', fontSize: 16 }} />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                ProjectFlow
              </Typography>
            </Box>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                🚀 Trusted by 10,000+ teams
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                ⭐ 4.9/5 Customer Rating
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                🔒 Enterprise Security
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                🌍 Global Support
              </Typography>
            </Stack>

            <Divider sx={{ width: '100%', maxWidth: 400 }} />
            
            <Typography variant="body2" sx={{ 
              textAlign: 'center', 
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}>
              © 2025 ProjectFlow. All rights reserved. Built with ❤️ using React & Material-UI.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;