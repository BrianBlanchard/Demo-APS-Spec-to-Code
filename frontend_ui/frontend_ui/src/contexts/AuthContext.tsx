import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthState } from '@/types/auth';
import { authService } from '@/services/auth';

interface AuthContextType extends AuthState {
  login: (userId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    sessionToken: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  // Initialize auth state from storage
  useEffect(() => {
    const token = authService.getSessionToken();
    const user = authService.getCurrentUser();

    if (token && user) {
      setState({
        user,
        sessionToken: token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState((prev: AuthState) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (userId: string, password: string) => {
    try {
      const response = await authService.login(userId, password);

      setState({
        user: response.user,
        sessionToken: response.sessionToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Redirect to landing page
      navigate(response.landingPage || '/dashboard');
    } catch (error) {
      setState((prev: AuthState) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setState({
        user: null,
        sessionToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      navigate('/login');
    }
  };

  const setUser = (user: User | null) => {
    setState((prev: AuthState) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
