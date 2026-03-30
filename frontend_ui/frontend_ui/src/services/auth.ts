import apiClient from './api';
import type {
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  NewPasswordRequest,
} from '@/types/auth';

// Authentication service
export const authService = {
  // Login user
  login: async (userId: string, password: string): Promise<LoginResponse> => {
    // Get client context
    const sessionContext = {
      ipAddress: 'client-ip', // This would be set by backend
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    const request: LoginRequest = {
      userId,
      password,
      sessionContext,
    };

    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', request);

    // Store token and user data
    if (response.data.success) {
      localStorage.setItem('sessionToken', response.data.sessionToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } finally {
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
    }
  },

  // Request password reset
  requestPasswordReset: async (userId: string, email?: string): Promise<PasswordResetResponse> => {
    const request: PasswordResetRequest = { userId, email };
    const response = await apiClient.post<PasswordResetResponse>('/api/v1/auth/password-reset', request);
    return response.data;
  },

  // Set new password
  setNewPassword: async (resetToken: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> => {
    const request: NewPasswordRequest = { resetToken, newPassword, confirmPassword };
    const response = await apiClient.post('/api/v1/auth/new-password', request);
    return response.data;
  },

  // Get current user from storage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get session token
  getSessionToken: () => {
    return localStorage.getItem('sessionToken');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('sessionToken');
  },
};
