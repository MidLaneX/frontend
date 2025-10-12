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
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Project Management Platform
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setTabValue(0)}
                sx={{ textTransform: 'none' }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => setTabValue(1)}
                sx={{ textTransform: 'none' }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 8, flex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6,
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* Left Side - Content */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={3}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                Streamline Your{' '}
                <Typography
                  component="span"
                  variant="h1"
                  sx={{ color: 'primary.main', fontWeight: 'inherit' }}
                >
                  Project Management
                </Typography>
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
              >
                Collaborate with your team, track progress, and deliver projects on time 
                with our comprehensive project management solution.
              </Typography>

              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setTabValue(1)}
                  sx={{ textTransform: 'none', px: 4 }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setTabValue(0)}
                  sx={{ textTransform: 'none', px: 4 }}
                >
                  Sign In
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Right Side - Auth Form */}
          <Box sx={{ flex: 1, maxWidth: 450, width: '100%' }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccountCircle sx={{ fontSize: 24, color: 'primary.main', mr: 1.5 }} />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {tabValue === 0 ? 'Welcome Back' : 'Create Account'}
                </Typography>
              </Box>

              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ 
                  mb: 3,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
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
                    sx={{ mb: 2 }}
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
                    sx={{ mb: 3 }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ py: 1.5, textTransform: 'none', fontWeight: 600, mb: 2 }}
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
                    sx={{ mb: 2 }}
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
                    sx={{ mb: 2 }}
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
                    sx={{ mb: 2 }}
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
                    sx={{ mb: 3 }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ py: 1.5, textTransform: 'none', fontWeight: 600, mb: 2 }}
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
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Stack spacing={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h2"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}
              >
                Everything you need to manage projects
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}
              >
                Our platform provides all the tools your team needs to collaborate 
                effectively and deliver successful projects.
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
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
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
          bgcolor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            © 2025 Project Management Platform. Built with React and Material-UI.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;