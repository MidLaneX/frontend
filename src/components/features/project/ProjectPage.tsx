import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Alert
} from '@mui/material';
import { 
  getFeatureComponent, 
  getAvailableFeatures,
  type TemplateType 
} from './templateRegistry';

interface ProjectPageProps {
  // Optional props for flexibility
  projectId?: string;
  projectName?: string;
  template?: TemplateType;
}

const ProjectPage: React.FC<ProjectPageProps> = (props) => {
  const { id: paramId } = useParams<{ id: string }>();
  
  // Use props or URL params
  const projectId = props.projectId || paramId || '1';
  const projectName = props.projectName || 'Sample Project';
  const template = props.template || 'scrum'; // Default to scrum
  
  const [activeTab, setActiveTab] = useState(0);
  
  // Get available features for this template
  const availableFeatures = getAvailableFeatures(template);
  
  if (!availableFeatures.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          No features available for template: {template}
        </Alert>
      </Box>
    );
  }
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Get current feature component
  const currentFeature = availableFeatures[activeTab];
  const FeatureComponent = getFeatureComponent(template, currentFeature);
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Project Header */}
      <Paper elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {projectName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Template: {template.charAt(0).toUpperCase() + template.slice(1)} | Project ID: {projectId}
          </Typography>
        </Box>
        
        {/* Dynamic Navigation Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ px: 3 }}
        >
          {availableFeatures.map((feature) => (
            <Tab 
              key={feature}
              label={feature.charAt(0).toUpperCase() + feature.slice(1)}
            />
          ))}
        </Tabs>
      </Paper>
      
      {/* Dynamic Feature Content */}
      <Box>
        {FeatureComponent ? (
          <FeatureComponent 
            projectId={projectId}
            projectName={projectName}
          />
        ) : (
          <Box sx={{ p: 3 }}>
            <Alert severity="info">
              Feature "{currentFeature}" not found for template "{template}"
            </Alert>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProjectPage;
