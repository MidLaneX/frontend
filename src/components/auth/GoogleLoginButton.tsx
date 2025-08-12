import React, { useEffect, useRef } from 'react';
import { Button, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { socialAuthService, type GoogleCredentialResponse } from '../../services/SocialAuthService';

interface GoogleLoginButtonProps {
  onSuccess: (accessToken: string, email: string, name: string, profilePicture?: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || disabled) return;

    const initGoogle = async () => {
      try {
        await socialAuthService.initializeGoogle(async (response: GoogleCredentialResponse) => {
          try {
            const socialResponse = await socialAuthService.decodeGoogleCredential(response.credential);
            onSuccess(
              socialResponse.accessToken,
              socialResponse.email,
              socialResponse.name,
              socialResponse.profilePicture
            );
          } catch (error) {
            onError('Failed to process Google login');
          }
        });

        // Render the Google button if element exists
        if (buttonRef.current) {
          buttonRef.current.innerHTML = ''; // Clear any existing content
          socialAuthService.renderGoogleButton('google-signin-button', 'outline');
        }
        
        initialized.current = true;
      } catch (error) {
        console.error('Failed to initialize Google login:', error);
        onError('Failed to initialize Google login');
      }
    };

    initGoogle();
  }, [onSuccess, onError, disabled]);

  return (
    <Box sx={{ width: '100%' }}>
      <div
        id="google-signin-button"
        ref={buttonRef}
        style={{
          width: '100%',
          display: disabled ? 'none' : 'block',
        }}
      />
      {disabled && (
        <Button
          fullWidth
          variant="outlined"
          disabled
          startIcon={<GoogleIcon />}
          sx={{
            py: 1.5,
            textTransform: 'none',
            borderColor: 'divider',
            color: 'text.disabled',
          }}
        >
          Continue with Google
        </Button>
      )}
    </Box>
  );
};

export default GoogleLoginButton;
