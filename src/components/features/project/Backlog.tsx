import React from 'react';
import BacklogComponent from './backlog/BacklogComponent';

interface BacklogProps {
  projectId: string;
  templateType: string;
}

/**
 * Backlog feature wrapper component
 * Maps to the "backlog" feature from backend
 */
const Backlog: React.FC<BacklogProps> = ({ projectId, templateType }) => {
  console.log(`🚀 Backlog feature loaded for project: ${projectId} (${templateType})`);
  
  return <BacklogComponent />;
};

export default Backlog;
