import { useEffect, useCallback } from "react";
import { tokenManager } from "../utils/tokenManager";
import { useAuth } from "../context/AuthContext";

const TOKEN_CHECK_INTERVAL = 5000; // Check every 5 seconds for testing (was 60000)

export const useTokenRefresh = () => {
  const { logout, refreshToken } = useAuth();

  const checkAndRefreshToken = useCallback(async () => {
    if (!tokenManager.hasTokens()) {
      return;
    }

    if (tokenManager.isTokenExpired()) {
      try {
        const success = await refreshToken();
        if (!success) {
          console.warn("Token refresh failed, logging out user");
          logout();
        }
      } catch (error) {
        console.error("Error during token refresh:", error);
        logout();
      }
    }
  }, [refreshToken, logout]);

  useEffect(() => {
    // Check immediately on mount
    checkAndRefreshToken();

    // Set up interval to check periodically
    const interval = setInterval(checkAndRefreshToken, TOKEN_CHECK_INTERVAL);

    // Listen for visibility change to check when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndRefreshToken();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAndRefreshToken]);

  return {
    checkAndRefreshToken,
  };
};
