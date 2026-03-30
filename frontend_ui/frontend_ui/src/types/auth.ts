// Authentication types
export interface LoginRequest {
  userId: string;
  password: string;
  sessionContext: {
    ipAddress: string;
    userAgent: string;
    timestamp: string;
  };
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  userType: 'ADMIN' | 'CSR' | 'CUSTOMER' | 'OPERATIONS';
  permissions: string[];
  email?: string;
}

export interface LoginResponse {
  success: boolean;
  sessionToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
  landingPage: string;
}

export interface AuthState {
  user: User | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PasswordResetRequest {
  userId: string;
  email?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

export interface NewPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}
