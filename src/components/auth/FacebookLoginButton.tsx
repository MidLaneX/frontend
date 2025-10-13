import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import { socialAuthService } from "../../services/SocialAuthService";

interface FacebookLoginButtonProps {
  onSuccess: (
    accessToken: string,
    email: string,
    name: string,
    profilePicture?: string,
  ) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initFacebook = async () => {
      try {
        await socialAuthService.initializeFacebook();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Facebook login:", error);
        onError("Failed to initialize Facebook login");
      }
    };

    if (!disabled) {
      initFacebook();
    }
  }, [onError, disabled]);

  const handleFacebookLogin = async () => {
    if (!isInitialized || disabled) return;

    try {
      const response = await socialAuthService.loginWithFacebook();
      onSuccess(
        response.accessToken,
        response.email,
        response.name,
        response.profilePicture,
      );
    } catch (error) {
      onError("Facebook login failed or was cancelled");
    }
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={handleFacebookLogin}
      disabled={disabled || !isInitialized}
      startIcon={<FacebookIcon />}
      sx={{
        py: 1.5,
        textTransform: "none",
        borderColor: "#1877F2",
        color: "#1877F2",
        "&:hover": {
          borderColor: "#166FE5",
          backgroundColor: "rgba(24, 119, 242, 0.04)",
        },
        "&:disabled": {
          borderColor: "divider",
          color: "text.disabled",
        },
      }}
    >
      Continue with Facebook
    </Button>
  );
};

export default FacebookLoginButton;
