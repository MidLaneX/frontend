import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  SupportAgent as SupportIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";

const Help: React.FC = () => {
  const faqs = [
    {
      question: "How do I create a new project?",
      answer:
        'Go to Organizations → Select your organization → Click "Create Project" → Choose a template (Scrum, Kanban, etc.)',
    },
    {
      question: "How do I invite team members?",
      answer:
        'In your project, go to Settings → Members → Click "Invite" and enter their email addresses.',
    },
    {
      question: "Can I switch between different project views?",
      answer:
        "Yes! Use the tabs at the top of your project to switch between Board, List, Timeline, and Calendar views.",
    },
    {
      question: "What project templates are available?",
      answer:
        "We offer 9 templates: Scrum, Kanban, Waterfall, Lean, Six Sigma, Startup, Matrix, Functional, and Traditional.",
    },
    {
      question: "How do I track project progress?",
      answer:
        "Each template includes built-in analytics like burndown charts, progress reports, and milestone tracking.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use enterprise-grade security with encryption and regular backups.",
    },
  ];

  const gettingStarted = [
    "Create your account with email or social login",
    "Set up your first organization",
    "Create a project using one of our templates",
    "Invite your team members",
    "Start creating and managing tasks",
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 3 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: "bold", color: "#172B4D", mb: 2 }}
          >
            Help Center
          </Typography>
          <Typography variant="h6" sx={{ color: "#5E6C84" }}>
            Everything you need to know about MidLaneX
          </Typography>
        </Box>

        {/* Getting Started */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 3,
              display: "flex",
              alignItems: "center",
            }}
          >
            <PlayIcon sx={{ mr: 2, color: "#0052CC" }} />
            Getting Started
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            New to MidLaneX? Follow these simple steps to get started quickly.
          </Alert>
          <List>
            {gettingStarted.map((step, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${index + 1}. ${step}`}
                  sx={{ "& .MuiListItemText-primary": { fontWeight: 500 } }}
                />
              </ListItem>
            ))}
          </List>
        </Card>

        {/* User Manual Download */}
        <Card sx={{ mb: 4, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              User Manual
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Download the complete user manual for step-by-step guidance and advanced tips.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            href="/user-manual.pdf"
            download
            sx={{ mt: { xs: 2, md: 0 }, fontWeight: 700 }}
          >
            Download PDF
          </Button>
        </Card>

        {/* Features Overview */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 3,
              display: "flex",
              alignItems: "center",
            }}
          >
            <DashboardIcon sx={{ mr: 2, color: "#0052CC" }} />
            Key Features
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Project Templates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose from 9 specialized templates for different methodologies
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Team Collaboration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time collaboration with comments and file sharing
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Task Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create, assign, and track tasks with custom priorities
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Multiple Views
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Board, List, Timeline, and Calendar views for your projects
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* FAQ */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 3,
              display: "flex",
              alignItems: "center",
            }}
          >
            <TaskIcon sx={{ mr: 2, color: "#0052CC" }} />
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Card>

        {/* Contact Support */}
        <Card 
          sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, #f8faff 0%, #f0f6ff 100%)',
            border: '1px solid #e3f2fd',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 82, 204, 0.08)'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 2,
              display: "flex",
              alignItems: "center",
              color: "#172B4D"
            }}
          >
            <SupportIcon sx={{ mr: 2, color: "#0052CC" }} />
            Need More Help?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: "#5E6C84", fontSize: '1.1rem' }}>
            Can't find what you're looking for? Our support team is here to help you succeed.
          </Typography>
          
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
              mb: 4,
            }}
          >
            {/* Email Support Card */}
            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid #e0e7ff',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0, 82, 204, 0.15)',
                  border: '1px solid #0052CC'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0052CC 0%, #0066ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <EmailIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#172B4D" }}>
                  Email Support
                </Typography>
              </Box>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 1,
                  '& a': {
                    color: '#0052CC',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }
                }}
              >
                <a href="mailto:info@midlana.com">
                  info@midlana.com
                </a>
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <TimeIcon sx={{ fontSize: 16, mr: 1 }} />
                <Typography variant="body2">
                  Response within 2-4 hours
                </Typography>
              </Box>
            </Card>

            {/* Live Chat Card */}
            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid #e0e7ff',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0, 82, 204, 0.15)',
                  border: '1px solid #0052CC'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <ChatIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#172B4D" }}>
                  Live Chat
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 1, color: "#172B4D" }}>
                Available in the app
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    mr: 1,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 },
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  24/7 support
                </Typography>
              </Box>
            </Card>
          </Box>

          {/* Action Buttons */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3, 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'center',
              mt: 2
            }}
          >
            <Button
              variant="contained"
              color="primary"
              href="mailto:info@midlana.com"
              startIcon={<EmailIcon sx={{ fontSize: 20 }} />}
              sx={{ 
                background: 'linear-gradient(135deg, #0052CC 0%, #0066ff 50%, #0052CC 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease-in-out infinite',
                boxShadow: '0 4px 20px rgba(0, 82, 204, 0.3)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #003d99 0%, #0052CC 50%, #003d99 100%)',
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: '0 12px 28px rgba(0, 82, 204, 0.4)',
                  '& .MuiButton-startIcon': {
                    transform: 'rotate(5deg) scale(1.1)'
                  }
                }, 
                fontWeight: 700,
                fontSize: '1rem',
                py: 2,
                px: 4,
                borderRadius: 3,
                textTransform: 'none',
                minWidth: 160,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '200% 0' },
                  '100%': { backgroundPosition: '-200% 0' }
                },
                '& .MuiButton-startIcon': {
                  transition: 'transform 0.3s ease'
                }
              }}
            >
              Send Email
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              href="tel:0773528200"
              startIcon={<PhoneIcon sx={{ fontSize: 20 }} />}
              sx={{ 
                fontWeight: 700,
                fontSize: '1rem',
                py: 2,
                px: 4,
                borderRadius: 3,
                textTransform: 'none',
                minWidth: 160,
                border: '2px solid transparent',
                background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #0052CC, #0066ff) border-box',
                color: '#0052CC',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  transition: 'left 0.5s ease'
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(0, 82, 204, 0.05), rgba(0, 102, 255, 0.05)) padding-box, linear-gradient(135deg, #0052CC, #0066ff) border-box',
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: '0 12px 28px rgba(0, 82, 204, 0.2)',
                  '&::before': {
                    left: '100%'
                  },
                  '& .MuiButton-startIcon': {
                    transform: 'rotate(-5deg) scale(1.1)',
                    animation: 'ring 0.6s ease-in-out'
                  }
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '& .MuiButton-startIcon': {
                  transition: 'transform 0.3s ease'
                },
                '@keyframes ring': {
                  '0%, 100%': { transform: 'rotate(-5deg) scale(1.1)' },
                  '25%': { transform: 'rotate(-10deg) scale(1.15)' },
                  '75%': { transform: 'rotate(0deg) scale(1.05)' }
                }
              }}
            >
              Call Now
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default Help;
