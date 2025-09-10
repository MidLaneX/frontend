import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Alert } from '@mui/material';
import Dashboard from './Dashboard';

const OrganizationDetailPage: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  let userId = queryParams.get('userId');
  if (!userId || userId === 'null' || userId === 'undefined') {
    // Try to get userId from auth_tokens in localStorage
    const tokens = localStorage.getItem('auth_tokens');
    if (tokens) {
      try {
        const parsed = JSON.parse(tokens);
        userId = parsed.userId ?? parsed.user_id ?? '';
        // If userId is a number, convert to string
        if (typeof userId === 'number') userId = String(userId);
      } catch {
        userId = '';
      }
    }
  }
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId || !userId || userId === 'null' || userId === 'undefined' || userId === '') {
      setError('Organization ID or User ID missing.');
    } else {
      setError(null);
    }
    // You can fetch organization details here using orgId and userId
  }, [orgId, userId]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Pass orgId and userId as numbers to Dashboard
  return (
    <Box sx={{ p: 3 }}>
      <Dashboard orgId={orgId ? Number(orgId) : undefined} userId={userId ? Number(userId) : undefined} />
    </Box>
  );
};

export default OrganizationDetailPage;
