import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthState } from '../types/auth';
import { authService } from '../services/auth';

const DEMO_USERS = [
  {
    userId: 'DEMO0001',
    password: 'password123',
    user: {
      userId: 'DEMO0001',
      name: 'Demo Admin',
      role: 'admin',
      firstName: 'Demo',
      lastName: 'Admin',
      userType: 'ADMIN',
      permissions: ['ALL'],
    },
    landingPage: '/dashboard',
  },
  {
    userId: 'DEMO0002',
    password: 'password123',
    user: {
      userId: 'DEMO0002',
      name: 'Demo User',
      role: 'user',
      firstName: 'Demo',
      lastName: 'User',
      userType: 'CUSTOMER',
      permissions: ['READ_ONLY'],
    },
    landingPage: '/dashboard',
  },
];

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

  // Initialize auth state from storage with local storage backdoor for demo user (manually added the backdoor - this wasn't created by AI/works)
 useEffect(() => {
  const token =
    localStorage.getItem('sessionToken') || authService.getSessionToken();

  const user =
    JSON.parse(localStorage.getItem('user') || 'null') ||
    authService.getCurrentUser();

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
          // 🔹 DEMO LOGIN SHORT-CIRCUIT for demo user (manually added the backdoor - this wasn't created by AI/works)
          const demoUser = DEMO_USERS.find(
            (u) => u.userId === userId && u.password === password
          );

          if (demoUser) {
            await new Promise((res) => setTimeout(res, 800));

            const fakeToken = 'demo-token';

            localStorage.setItem('sessionToken', fakeToken);
            localStorage.setItem('user', JSON.stringify(demoUser.user));

            setState({
              user: demoUser.user,
              sessionToken: fakeToken,
              isAuthenticated: true,
              isLoading: false,
            });

            navigate(demoUser.landingPage);
            return;
          }
          // 🔹 FALLBACK (keeps existing behavior if ever needed)
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
      
      //Logout local storage for demo user backdoor - Manually added - Not created by AI/works
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      
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
