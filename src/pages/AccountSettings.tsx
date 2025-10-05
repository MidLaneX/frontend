import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  Typography,
  Avatar,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material'
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  CreditCard as CreditCardIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  Shield as ShieldIcon,
  Key as KeyIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Palette as PaletteIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { UserService } from '@/services/UserService'
import { useAuth } from '@/context/AuthContext'

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AccountSettings: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile data - will be populated from API
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    location: 'Colombo, Sri Lanka', // Keep as default since not in API
    timezone: 'Asia/Colombo', // Keep as default since not in API
    language: 'English', // Keep as default since not in API
    bio: 'Passionate developer building scalable web applications.' // Keep as default since not in API
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated || !user?.userId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user profile for account settings, userId:', user.userId);
        const profile = await UserService.getUserProfile(user.userId);
        console.log('Fetched user profile for settings:', profile);
        
        // Update profile data with real API data
        setProfileData({
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          jobTitle: profile.job_title,
          department: profile.department,
          location: 'Colombo, Sri Lanka', // Default value
          timezone: 'Asia/Colombo', // Default value
          language: 'English', // Default value
          bio: 'Passionate developer building scalable web applications.' // Default value
        });
      } catch (err) {
        console.error('Error fetching user profile for account settings:', err);
        setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.userId, isAuthenticated]);

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true,
  });

  // Notification preferences
  const [notificationSettings, setNotificationSettings] = useState({
    projectUpdates: true,
    taskAssignments: true,
    mentions: true,
    deadlineReminders: true,
    weeklyDigest: true,
    marketingEmails: false,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveProfile = async () => {
    if (!user?.userId) return;

    try {
      console.log('Saving profile data:', profileData);
      await UserService.updateUserProfile(user.userId, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        jobTitle: profileData.jobTitle,
        department: profileData.department
      });
      
      setIsEditing(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      console.log('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#FAFBFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            color: '#172B4D',
            mb: 1,
            fontSize: '28px'
          }}
        >
          Account Settings
        </Typography>
        <Typography variant="body1" sx={{ color: '#5E6C84', fontSize: '16px' }}>
          Manage your account preferences, security settings, and billing information
        </Typography>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success notification */}
      {showNotification && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setShowNotification(false)}
        >
          Profile updated successfully!
        </Alert>
      )}

      {/* Main Content - Only show when not loading */}
      {!loading && (
      <Card 
        sx={{ 
          borderRadius: 3,
          border: '1px solid #DFE1E6',
          boxShadow: '0 1px 3px rgba(9,30,66,0.25)',
          bgcolor: 'white'
        }}
      >
        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: '1px solid #DFE1E6' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              px: 3,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                minHeight: 64,
                color: '#5E6C84',
                '&.Mui-selected': {
                  color: '#0052CC'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#0052CC',
                height: 3
              }
            }}
          >
            <Tab icon={<PersonIcon />} label="Profile" iconPosition="start" />
            <Tab icon={<SecurityIcon />} label="Security" iconPosition="start" />
            <Tab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
            <Tab icon={<CreditCardIcon />} label="Billing" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            {/* Profile Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative', mr: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: '#FF5722',
                    fontSize: '36px',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(255,87,34,0.3)'
                  }}
                >
                  {(profileData.firstName?.[0] || '').toUpperCase()}{(profileData.lastName?.[0] || '').toUpperCase()}
                </Avatar>
                <Tooltip title="Change profile picture">
                  <IconButton 
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: '#0052CC',
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': { bgcolor: '#0747A6' }
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#172B4D', mb: 1 }}>
                  {profileData.firstName} {profileData.lastName}
                </Typography>
                <Typography variant="body1" sx={{ color: '#5E6C84', mb: 1 }}>
                  {profileData.jobTitle} • {profileData.department}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label="Freemium Account"
                    size="small"
                    sx={{ bgcolor: '#0052CC', color: 'white', fontWeight: 600 }}
                  />
                  <Chip 
                    label="Verified"
                    size="small"
                    icon={<CheckIcon sx={{ fontSize: 14 }} />}
                    sx={{ bgcolor: '#E3FCEF', color: '#00875A', fontWeight: 600 }}
                  />
                </Box>
              </Box>
              <Button
                variant={isEditing ? "contained" : "outlined"}
                startIcon={isEditing ? <CheckIcon /> : <EditIcon />}
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  ...(isEditing && {
                    bgcolor: '#00875A',
                    '&:hover': { bgcolor: '#006644' }
                  })
                }}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Box>

            {/* Profile Form */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              <TextField
                label="First Name"
                value={profileData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                fullWidth
                sx={{ mb: 3 }}
              />
              <TextField
                label="Last Name"
                value={profileData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                fullWidth
                sx={{ mb: 3 }}
              />
              <TextField
                label="Email Address"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={true} // Email should not be editable
                fullWidth
                sx={{ mb: 3 }}
                helperText="Email address cannot be changed. Contact support if needed."
              />
              <TextField
                label="Phone Number"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                fullWidth
                sx={{ mb: 3 }}
              />
              <TextField
                label="Job Title"
                value={profileData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                disabled={!isEditing}
                fullWidth
                sx={{ mb: 3 }}
              />
              <TextField
                label="Department"
                value={profileData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={!isEditing}
                fullWidth
                sx={{ mb: 3 }}
              />
              <TextField
                label="Location"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
                fullWidth
                sx={{ mb: 3 }}
              />
              <TextField
                label="Timezone"
                value={profileData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                disabled={!isEditing}
                fullWidth
                sx={{ mb: 3 }}
              />
            </Box>
            <TextField
              label="Bio"
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            {/* Password Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #DFE1E6' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <KeyIcon sx={{ color: '#0052CC', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Password & Login
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#5E6C84', mb: 3 }}>
                Keep your account secure with a strong password
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Change Password
                </Button>
                <Button
                  variant="text"
                  startIcon={showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#5E6C84' }}
                >
                  {showPassword ? 'Hide' : 'Show'} Password Strength
                </Button>
              </Box>
            </Paper>

            {/* Two-Factor Authentication */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #DFE1E6' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShieldIcon sx={{ color: '#00875A', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Two-Factor Authentication
                </Typography>
                <Chip 
                  label="Enabled"
                  size="small"
                  sx={{ ml: 2, bgcolor: '#E3FCEF', color: '#00875A', fontWeight: 600 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#5E6C84', mb: 3 }}>
                Add an extra layer of security to your account
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon sx={{ color: '#0052CC' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email Authentication" 
                    secondary="Get security codes via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon sx={{ color: '#FF8B00' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="SMS Authentication" 
                    secondary="Get security codes via SMS"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={securitySettings.smsNotifications}
                      onChange={(e) => handleSecurityChange('smsNotifications', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>

            {/* Login Activity */}
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #DFE1E6' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon sx={{ color: '#5243AA', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Login Activity
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#5E6C84', mb: 3 }}>
                Monitor your account activity and get alerts for suspicious logins
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.loginAlerts}
                    onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                    color="primary"
                  />
                }
                label="Send login alerts to email"
                sx={{ mb: 2 }}
              />
              <Box>
                <Button
                  variant="outlined"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  View Login History
                </Button>
              </Box>
            </Paper>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            {/* Email Notifications */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #DFE1E6' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ color: '#0052CC', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Email Notifications
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#5E6C84', mb: 3 }}>
                Choose what updates you want to receive via email
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Project Updates" 
                    secondary="Notifications about project progress, milestones, and changes"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.projectUpdates}
                      onChange={(e) => handleNotificationChange('projectUpdates', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Task Assignments" 
                    secondary="When tasks are assigned to you or when you're mentioned"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.taskAssignments}
                      onChange={(e) => handleNotificationChange('taskAssignments', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Mentions & Comments" 
                    secondary="When someone mentions you in comments or discussions"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.mentions}
                      onChange={(e) => handleNotificationChange('mentions', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Deadline Reminders" 
                    secondary="Reminders about approaching deadlines and due dates"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.deadlineReminders}
                      onChange={(e) => handleNotificationChange('deadlineReminders', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Weekly Digest" 
                    secondary="Weekly summary of your projects and team activity"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.weeklyDigest}
                      onChange={(e) => handleNotificationChange('weeklyDigest', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Marketing Emails" 
                    secondary="Product updates, tips, and promotional content"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onChange={(e) => handleNotificationChange('marketingEmails', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>

            {/* Preferences */}
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #DFE1E6' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaletteIcon sx={{ color: '#5243AA', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Preferences
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#5E6C84', mb: 3 }}>
                Customize your experience
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <TextField
                  select
                  label="Language"
                  value={profileData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  sx={{ flex: '1 1 300px' }}
                  SelectProps={{ native: true }}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Español</option>
                  <option value="French">Français</option>
                  <option value="German">Deutsch</option>
                </TextField>
                <TextField
                  select
                  label="Theme"
                  value="Light"
                  sx={{ flex: '1 1 300px' }}
                  SelectProps={{ native: true }}
                >
                  <option value="Light">Light Mode</option>
                  <option value="Dark">Dark Mode</option>
                  <option value="Auto">Auto (System)</option>
                </TextField>
              </Box>
            </Paper>
          </Box>
        </TabPanel>

        {/* Billing Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ px: 3 }}>
            {/* Current Plan */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #DFE1E6' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ color: '#0052CC', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Current Plan
                </Typography>
                <Chip 
                  label="Freemium"
                  size="small"
                  sx={{ ml: 2, bgcolor: '#0052CC', color: 'white', fontWeight: 600 }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#172B4D', mb: 1 }}>
                    Free<Typography component="span" variant="body1" sx={{ color: '#5E6C84' }}> Forever</Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5E6C84', mb: 2 }}>
                    Enjoy our core features at no cost
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="Core Features" size="small" sx={{ bgcolor: '#E3FCEF', color: '#00875A' }} />
                    <Chip label="Basic Projects" size="small" sx={{ bgcolor: '#E7F3FF', color: '#0052CC' }} />
                    <Chip label="Community Support" size="small" sx={{ bgcolor: '#FFF7E6', color: '#FF8B00' }} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#FFAB00', '&:hover': { bgcolor: '#FF8B00' } }}>
                    Upgrade Soon
                  </Button>
                </Box>
              </Box>
              
              {/* Premium Coming Soon Alert */}
              <Alert 
                severity="info" 
                sx={{ 
                  bgcolor: '#E7F3FF', 
                  border: '1px solid #B3D4FF',
                  '& .MuiAlert-icon': { color: '#0052CC' }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  🚀 Premium Plan Coming Soon!
                </Typography>
                <Typography variant="body2" sx={{ color: '#5E6C84' }}>
                  We're working on advanced features including unlimited projects, advanced analytics, 
                  AI-powered insights, priority support, and much more. Stay tuned!
                </Typography>
              </Alert>
            </Paper>

            {/* Payment Method */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #DFE1E6' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CreditCardIcon sx={{ color: '#5E6C84', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Payment Method
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                py: 4,
                bgcolor: '#F4F5F7',
                borderRadius: 2
              }}>
                <CreditCardIcon sx={{ color: '#B3BAC5', fontSize: 48, mb: 2 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#5E6C84', mb: 1 }}>
                  No Payment Method Required
                </Typography>
                <Typography variant="body2" sx={{ color: '#8993A4', textAlign: 'center' }}>
                  You're currently on our free plan. Add a payment method when premium features become available.
                </Typography>
              </Box>
            </Paper>

            {/* Account Activity */}
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #DFE1E6' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#172B4D' }}>
                  Account Activity
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                py: 4,
                bgcolor: '#F4F5F7',
                borderRadius: 2
              }}>
                <ScheduleIcon sx={{ color: '#B3BAC5', fontSize: 48, mb: 2 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#5E6C84', mb: 1 }}>
                  No Billing History
                </Typography>
                <Typography variant="body2" sx={{ color: '#8993A4', textAlign: 'center' }}>
                  You're enjoying our free plan! Billing history will appear here when you upgrade to premium.
                </Typography>
              </Box>
            </Paper>
          </Box>
        </TabPanel>
      </Card>
      )}
    </Box>
  )
}

export default AccountSettings
