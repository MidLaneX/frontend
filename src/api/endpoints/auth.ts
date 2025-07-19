import { apiClient } from '../client';
import type { SignupData } from '../../context/AuthContext';

export interface LoginRequest {
  email: string;
  password: string;
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
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
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