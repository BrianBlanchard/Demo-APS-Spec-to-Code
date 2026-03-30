import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/button';
import { Card } from '@/components/card';

export default function DashboardView() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    {
      title: 'Account Management',
      description: 'Search and manage customer accounts',
      route: '/accounts/search',
      icon: '🏦',
    },
    {
      title: 'Transaction Entry',
      description: 'Enter and process transactions',
      route: '/transactions/entry',
      icon: '💳',
    },
    {
      title: 'Transaction Search',
      description: 'Search transaction history',
      route: '/transactions/search',
      icon: '🔍',
    },
    {
      title: 'Payments',
      description: 'Process payments and transfers',
      route: '/payments/select-account',
      icon: '💰',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Advanced Payment System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.firstName} {user.lastName}
              </span>
              <span className="text-xs text-gray-500">({user.userType})</span>
              <Button variant="secondary" size="small" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Dashboard
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <Card key={item.title}>
                <div className="flex flex-col h-full">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 flex-grow">
                    {item.description}
                  </p>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={() => navigate(item.route)}
                    className="w-full"
                  >
                    Access
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
