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
  token: string;
  userId: number;
  email: string;
}

export interface MeResponse {
  userId: number;
  email: string;
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

  me: async (): Promise<MeResponse> => {
    const response = await apiClient.get<MeResponse>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};