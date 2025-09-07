import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  RocketLaunch as RocketIcon,
  Group as TeamIcon,
  Lightbulb as InnovationIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Analytics as AnalyticsIcon,
  IntegrationInstructions as IntegrationIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Public as GlobalIcon,
} from '@mui/icons-material';

const About: React.FC = () => {
  const features = [
    {
      icon: <RocketIcon sx={{ fontSize: 40, color: '#0052CC' }} />,
      title: 'Rapid Deployment',
      description: 'Get your projects up and running in minutes with our streamlined setup process.',
    },
    {
      icon: <TeamIcon sx={{ fontSize: 40, color: '#00875A' }} />,
      title: 'Team Collaboration',
      description: 'Built-in tools for seamless team communication and project coordination.',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#FF8B00' }} />,
      title: 'Advanced Analytics',
      description: 'Deep insights into project performance and team productivity metrics.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#DE350B' }} />,
      title: 'Enterprise Security',
      description: 'Bank-level security with end-to-end encryption and compliance standards.',
    },
    {
      icon: <CloudIcon sx={{ fontSize: 40, color: '#6554C0' }} />,
      title: 'Cloud-Native',
      description: 'Fully cloud-based solution with 99.9% uptime and global accessibility.',
    },
    {
      icon: <IntegrationIcon sx={{ fontSize: 40, color: '#36B37E' }} />,
      title: 'Seamless Integrations',
      description: 'Connect with your favorite tools and services through our robust API.',
    },
  ];

  const stats = [
    { label: 'Active Users', value: '50,000+', icon: <TeamIcon /> },
    { label: 'Projects Managed', value: '1M+', icon: <RocketIcon /> },
    { label: 'Countries', value: '120+', icon: <GlobalIcon /> },
    { label: 'Customer Satisfaction', value: '98%', icon: <StarIcon /> },
  ];

  const values = [
    'Innovation-driven development',
    'User-centric design philosophy',
    'Transparent and agile processes',
    'Commitment to data security',
    'Continuous improvement mindset',
    'Global accessibility focus',
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflow: 'auto',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#0052CC',
                fontSize: 32,
                fontWeight: 'bold',
                mr: 3,
                boxShadow: '0 8px 32px rgba(0,82,204,0.3)',
              }}
            >
              M
            </Avatar>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: '#172B4D',
                  letterSpacing: '-1px',
                }}
              >
                MidLaneX
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#5E6C84',
                  fontWeight: 300,
                  letterSpacing: '1px',
                }}
              >
                PROJECT MANAGEMENT REIMAGINED
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: '#172B4D',
              mb: 3,
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            Empowering teams to deliver exceptional results through intelligent project management
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#5E6C84',
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            MidLaneX is the next-generation project management platform that combines powerful features 
            with intuitive design to help teams of all sizes achieve their goals faster and more efficiently.
          </Typography>
        </Box>

        {/* Mission Section */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 6, 
            mb: 8, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #E3FCEF 0%, #F0F8FF 100%)',
          }}
        >
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 6, 
            alignItems: 'center' 
          }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: '#172B4D',
                  mb: 3,
                }}
              >
                Our Mission
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#5E6C84',
                  lineHeight: 1.7,
                  fontWeight: 400,
                }}
              >
                To revolutionize how teams collaborate and manage projects by providing an 
                intelligent, flexible, and user-friendly platform that adapts to any workflow, 
                methodology, or industry requirement.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <InnovationIcon sx={{ fontSize: 200, color: '#0052CC', opacity: 0.8 }} />
            </Box>
          </Box>
        </Paper>

        {/* Stats Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#172B4D',
              textAlign: 'center',
              mb: 6,
            }}
          >
            Trusted by Teams Worldwide
          </Typography>
          
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 4,
          }}>
            {stats.map((stat, index) => (
              <Card
                key={index}
                elevation={2}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box sx={{ color: '#0052CC', mb: 2 }}>
                  {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: '#172B4D',
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#5E6C84',
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#172B4D',
              textAlign: 'center',
              mb: 2,
            }}
          >
            What Makes Us Different
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#5E6C84',
              textAlign: 'center',
              mb: 6,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Discover the powerful features that set MidLaneX apart from traditional project management tools
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 4,
          }}>
            {features.map((feature, index) => (
              <Card
                key={index}
                elevation={2}
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 0 }}>
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: '#172B4D',
                      mb: 2,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#5E6C84',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Company Values */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 6 
          }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: '#172B4D',
                  mb: 3,
                }}
              >
                Our Values
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#5E6C84',
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                The principles that guide everything we do at MidLaneX
              </Typography>
              
              <List>
                {values.map((value, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <CheckIcon sx={{ color: '#00875A' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={value}
                      primaryTypographyProps={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: '#172B4D',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #FFF4E6 0%, #F0F8FF 100%)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: '#172B4D',
                  mb: 3,
                  textAlign: 'center',
                }}
              >
                Built for Scale
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#5E6C84',
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                From startups to enterprise organizations, MidLaneX scales 
                seamlessly to meet your growing needs. Our platform supports 
                multiple project methodologies and can adapt to any team size 
                or organizational structure.
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Technology Stack */}
        <Paper
          elevation={2}
          sx={{
            p: 6,
            borderRadius: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #F8F9FA 0%, #E8F5E8 100%)',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#172B4D',
              mb: 3,
            }}
          >
            Powered by Modern Technology
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#5E6C84',
              mb: 4,
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            Built with cutting-edge technologies to ensure reliability, performance, and security
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {['React', 'TypeScript', 'Material-UI', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'Kubernetes'].map((tech) => (
              <Chip
                key={tech}
                label={tech}
                variant="outlined"
                sx={{
                  px: 2,
                  py: 1,
                  fontSize: 14,
                  fontWeight: 600,
                  borderColor: '#0052CC',
                  color: '#0052CC',
                  '&:hover': {
                    bgcolor: '#0052CC',
                    color: 'white',
                  },
                }}
              />
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default About;
