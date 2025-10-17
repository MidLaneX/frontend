import React from 'react';
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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material';

const Help: React.FC = () => {
  const faqs = [
    {
      question: 'How do I create a new project?',
      answer: 'Go to Organizations → Select your organization → Click "Create Project" → Choose a template (Scrum, Kanban, etc.)',
    },
    {
      question: 'How do I invite team members?',
      answer: 'In your project, go to Settings → Members → Click "Invite" and enter their email addresses.',
    },
    {
      question: 'Can I switch between different project views?',
      answer: 'Yes! Use the tabs at the top of your project to switch between Board, List, Timeline, and Calendar views.',
    },
    {
      question: 'What project templates are available?',
      answer: 'We offer 9 templates: Scrum, Kanban, Waterfall, Lean, Six Sigma, Startup, Matrix, Functional, and Traditional.',
    },
    {
      question: 'How do I track project progress?',
      answer: 'Each template includes built-in analytics like burndown charts, progress reports, and milestone tracking.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use enterprise-grade security with encryption and regular backups.',
    },
  ];

  const gettingStarted = [
    'Create your account with email or social login',
    'Set up your first organization',
    'Create a project using one of our templates',
    'Invite your team members',
    'Start creating and managing tasks',
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#172B4D', mb: 2 }}>
            Help Center
          </Typography>
          <Typography variant="h6" sx={{ color: '#5E6C84' }}>
            Everything you need to know about MidLaneX
          </Typography>
        </Box>

        {/* Getting Started */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
            <PlayIcon sx={{ mr: 2, color: '#0052CC' }} />
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
                  sx={{ '& .MuiListItemText-primary': { fontWeight: 500 } }}
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
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 2, color: '#0052CC' }} />
            Key Features
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Project Templates</Typography>
              <Typography variant="body2" color="text.secondary">
                Choose from 9 specialized templates for different methodologies
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Team Collaboration</Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time collaboration with comments and file sharing
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Task Management</Typography>
              <Typography variant="body2" color="text.secondary">
                Create, assign, and track tasks with custom priorities
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Multiple Views</Typography>
              <Typography variant="body2" color="text.secondary">
                Board, List, Timeline, and Calendar views for your projects
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* FAQ */}
        <Card sx={{ mb: 4, p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
            <TaskIcon sx={{ mr: 2, color: '#0052CC' }} />
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
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
        <Card sx={{ p: 3, bgcolor: '#F8F9FA' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
            <SupportIcon sx={{ mr: 2, color: '#0052CC' }} />
            Need More Help?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Can't find what you're looking for? Our support team is here to help.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Email Support</Typography>
              <Typography variant="body2">support@midlanex.com</Typography>
              <Typography variant="body2" color="text.secondary">Response within 2-4 hours</Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Live Chat</Typography>
              <Typography variant="body2">Available in the app</Typography>
              <Typography variant="body2" color="text.secondary">24/7 support</Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            sx={{ bgcolor: '#0052CC', '&:hover': { bgcolor: '#003d99' } }}
          >
            Contact Support
          </Button>
        </Card>
      </Container>
    </Box>
  );
};

export default Help;
