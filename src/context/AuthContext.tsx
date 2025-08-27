import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi, type SocialLoginRequest } from '../api/endpoints/auth';
import { tokenManager } from '../utils/tokenManager';

export interface User {
  userId: number;
  email: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  socialLogin: (data: SocialLoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

export interface SignupData {
  email: string;
  password: string;
  phone?: string; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing token on app startup
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Migrate from legacy token format if needed
        tokenManager.migrateFromLegacyToken();
        
        // Check if we have valid tokens
        if (tokenManager.hasTokens()) {
          const validToken = await tokenManager.getValidAccessToken();
          
          if (validToken) {
            // Use stored user data from tokenManager instead of calling /me
            const storedUserId = tokenManager.getUserId();
            const storedEmail = tokenManager.getUserEmail();
            const storedRole = tokenManager.getUserRole();
            
            if (storedUserId && storedEmail && storedRole) {
              const userData: User = {
                userId: storedUserId,
                email: storedEmail,
                role: storedRole,
              };
              setUser(userData);
            } else {
              // No stored user data available, clear tokens
              tokenManager.clearTokens();
            }
          } else {
            // Tokens are invalid/expired and couldn't be refreshed
            tokenManager.clearTokens();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        tokenManager.clearTokens();
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authApi.login({
        email,
        password,
      });
    
      console.log("Login response:", response);
      
      // Store tokens using token manager - user_id will be extracted automatically
      tokenManager.setTokens(response);
      
      console.log("Login successful, tokens stored");
      
      // Create user object from response
      const userData: User = {
        userId: response.user_id, // Extract user_id from backend response
        email: response.user_email,
        role: response.role,
      };
      
      console.log("User data:", userData);
      
      // Update user state
      setUser(userData);
    } catch (error: any) {
      // Re-throw the error to preserve the original error structure
      throw error;
    }
  };

  const signup = async (userData: SignupData): Promise<void> => {
    try {
      const response = await authApi.signup(userData);

      console.log("Signup response:", response);
      
      // Store tokens using token manager - user_id will be extracted automatically
      tokenManager.setTokens(response);
      
      // Create user object from response
      const newUser: User = {
        userId: response.user_id, // Extract user_id from backend response
        email: response.user_email,
        role: response.role,
      };
      
      console.log("Signup user data:", newUser);
      
      // Update user state
      setUser(newUser);
    } catch (error: any) {
      // Re-throw the error to preserve the original error structure
      throw error;
    }
  };

  const socialLogin = async (data: SocialLoginRequest): Promise<void> => {
    try {
      const response = await authApi.socialLogin(data);

      console.log("Social login response:", response);
      
      // Store tokens using token manager - user_id will be extracted automatically
      tokenManager.setTokens(response);
      
      // Create user object from response
      const newUser: User = {
        userId: response.user_id, // Extract user_id from backend response
        email: response.user_email,
        role: response.role,
      };
      
      console.log("Social login user data:", newUser);
      
      // Update user state
      setUser(newUser);
    } catch (error: any) {
      // Re-throw the error to preserve the original error structure
      throw error;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const success = await tokenManager.refreshAccessToken();
      if (!success) {
        setUser(null);
      }
      return success;
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
      return false;
    }
  };

  const logout = () => {
    tokenManager.clearTokens();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    socialLogin,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};