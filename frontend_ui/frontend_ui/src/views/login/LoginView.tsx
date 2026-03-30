import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Alert } from '@/components/alert';

export default function LoginView() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!userId || !password) {
      setErrorMessage('Please enter both User ID and Password');
      return;
    }

    if (userId.length !== 8) {
      setErrorMessage('User ID must be exactly 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await login(userId, password);
      // Navigation handled by AuthContext
    } catch (error: any) {
      setIsLoading(false);
      if (error.status === 401) {
        setErrorMessage('Invalid User ID or Password. Please try again.');
      } else if (error.status === 423) {
        setErrorMessage('Account locked due to multiple failed attempts. Contact help desk.');
      } else if (error.status === 429) {
        setErrorMessage('Too many login attempts. Please wait a few minutes.');
      } else {
        setErrorMessage('System unavailable. Please try again later.');
      }
    }
  };

  const handleForgotPassword = () => {
    navigate('/password-reset');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Advanced Payment System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}

          <div className="space-y-4">
            <Input
              label="User ID"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter 8-character User ID"
              maxLength={8}
              required
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            isLoading={isLoading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          <p>For assistance, contact the help desk</p>
        </div>
      </div>
    </div>
  );
}
