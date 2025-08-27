import { apiClient } from '../client';
import type { SignupData } from '../../context/AuthContext';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'facebook';
  accessToken: string;
  email: string;
  name: string;
  profilePicture?: string;
}

// Update interfaces to match backend response format
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_email: string;
  role: string;
  user_id: number; // Backend sends user_id (snake_case)
}

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceInfo: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_email: string;
  role: string;
  user_id: number; // Backend sends user_id (snake_case)
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/initial/login', data);
    return response.data;
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/initial/register', data);
    return response.data;
  },

  socialLogin: async (data: SocialLoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/initial/social/login', data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/initial/refresh', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};