import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardActionArea,
  CardContent,
  TextField,
  Stepper,
  Step,
  StepLabel,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Code as SoftwareIcon,
  Dashboard as ClassicIcon,
  Work as ProjectIcon,
} from '@mui/icons-material';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreateProject: (projectData: any) => void;
  loading: boolean;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onClose,
  onCreateProject,
  loading,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    teamId: '',
    createdBy: '',
  });

  const steps = ['Select Type', 'Choose Template', 'Project Details'];

  const projectTypes = [
    {
      type: 'Software',
      description: 'For software development projects',
      icon: SoftwareIcon,
      color: '#0052CC',
    },
    {
      type: 'Business',
      description: 'For business and marketing projects',
      icon: BusinessIcon,
      color: '#00875A',
    },
    {
      type: 'Classic',
      description: 'For traditional project management',
      icon: ClassicIcon,
      color: '#6554C0',
    },
  ];

  const templateOptions: Record<string, Array<{ name: string; description: string }>> = {
    Software: [
      { name: 'Scrum', description: 'Agile development with sprints' },
      { name: 'Kanban', description: 'Continuous flow methodology' },
      { name: 'Waterfall', description: 'Sequential development phases' },
    ],
    Business: [
      { name: 'Lean', description: 'Lean startup methodology' },
      { name: 'Six Sigma', description: 'Quality improvement process' },
      { name: 'Startup', description: 'Early stage business development' },
    ],
    Classic: [
      { name: 'Traditional', description: 'Classic project management' },
      { name: 'Matrix', description: 'Matrix organizational structure' },
      { name: 'Functional', description: 'Functional organizational approach' },
    ],
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    handleNext();
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    handleNext();
  };

  const handleCreate = () => {
    const finalProjectData = {
      ...projectData,
      type: selectedType,
      templateType: selectedTemplate,
    };
    onCreateProject(finalProjectData);
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedType('');
    setSelectedTemplate('');
    setProjectData({ name: '', description: '', teamId: '', createdBy: '' });
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Choose the type of project you want to create
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {projectTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card
                    key={type.type}
                    sx={{
                      border: '1px solid #DFE1E6',
                      '&:hover': {
                        borderColor: type.color,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardActionArea onClick={() => handleTypeSelect(type.type)}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              backgroundColor: `${type.color}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IconComponent sx={{ color: type.color, fontSize: 24 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {type.type}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {type.description}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Select a template for your {selectedType.toLowerCase()} project
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {templateOptions[selectedType]?.map((template) => (
                <Card
                  key={template.name}
                  sx={{
                    border: '1px solid #DFE1E6',
                    '&:hover': {
                      borderColor: '#0052CC',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardActionArea onClick={() => handleTemplateSelect(template.name)}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              Fill in the project details
            </Typography>
            <TextField
              label="Project Name"
              value={projectData.name}
              onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={projectData.description}
              onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Team ID (Optional)"
              type="number"
              value={projectData.teamId}
              onChange={(e) => setProjectData(prev => ({ ...prev, teamId: e.target.value }))}
              fullWidth
              helperText="Enter the ID of the team to assign to this project (leave empty to assign later)"
              InputProps={{
                inputProps: { min: 1 }
              }}
            />
            <TextField
              label="Created By"
              value={projectData.createdBy}
              onChange={(e) => setProjectData(prev => ({ ...prev, createdBy: e.target.value }))}
              fullWidth
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 500,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ProjectIcon sx={{ color: '#0052CC' }} />
            <Typography variant="h6" fontWeight={600}>
              Create Project
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={activeStep === 0 ? handleClose : handleBack}
          sx={{ textTransform: 'none' }}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={loading || !projectData.name.trim()}
            sx={{ textTransform: 'none' }}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectModal;
