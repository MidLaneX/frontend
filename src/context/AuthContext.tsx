import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi, type SocialLoginRequest } from '../api/endpoints/auth';

export interface User {
  userId: number;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  socialLogin: (data: SocialLoginRequest) => Promise<void>;
  logout: () => void;
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
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Verify token with backend
          const response = await authApi.me();
          // Backend response: { userId, email }
          const userData: User = {
            userId: response.userId,
            email: response.email,
          };
          setUser(userData);
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
        }
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
      
      // Backend sends: { token, userId, email }
      const { token, userId, email: userEmail } = response;
      
      // Store token
      localStorage.setItem('authToken', token);
      
      console.log("Login successful, token stored:", token);
      
      // Create user object from response
      const userData: User = {
        userId,
        email: userEmail,
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
      
      // Backend sends: { token, userId, email }
      const { token, userId, email: userEmail } = response;
      
      // Store token
      localStorage.setItem('authToken', token);
      
      // Create user object from response
      const newUser: User = {
        userId,
        email: userEmail,
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
      
      // Backend sends: { token, userId, email }
      const { token, userId, email: userEmail } = response;
      
      // Store token
      localStorage.setItem('authToken', token);
      
      // Create user object from response
      const newUser: User = {
        userId,
        email: userEmail,
      };
      
      console.log("Social login user data:", newUser);
      
      // Update user state
      setUser(newUser);
    } catch (error: any) {
      // Re-throw the error to preserve the original error structure
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};