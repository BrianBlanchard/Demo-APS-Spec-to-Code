import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Alert } from '../../components/alert';

export default function PasswordResetView() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [ssnLast4, setSsnLast4] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (userId.length !== 8) {
      setErrorMessage('User ID must be exactly 8 characters');
      return;
    }

    if (ssnLast4.length !== 4 || !/^\d{4}$/.test(ssnLast4)) {
      setErrorMessage('SSN Last 4 must be exactly 4 numeric digits');
      return;
    }

    if (failedAttempts >= 3) {
      setErrorMessage('Too many failed attempts. Please contact help desk at (800) 555-0100.');
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful verification - navigate to new password screen
      navigate('/auth/password-reset/new-password', {
        state: { userId, resetToken: 'mock_token_12345' }
      });
    } catch (error: any) {
      setIsLoading(false);

      if (error.status === 404) {
        setErrorMessage('User ID not found. Please check and try again.');
        setUserId('');
        setSsnLast4('');
      } else if (error.status === 401) {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        setSsnLast4('');

        if (newFailedAttempts >= 3) {
          setErrorMessage('Too many failed attempts. Please contact help desk at (800) 555-0100.');
        } else {
          setErrorMessage('Identity verification failed. Information does not match our records.');
        }
      } else if (error.status === 429) {
        setErrorMessage('Too many verification attempts. Please try again in 60 minutes.');
      } else if (error.status === 423) {
        setErrorMessage('Account locked. Contact administrator at (800) 555-0100.');
      } else {
        setErrorMessage('System unavailable. Please try again later.');
      }
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Verify your identity to reset your password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Security Notice:</strong> You will need your User ID and the last 4 digits
              of your Social Security Number to verify your identity.
            </p>
          </div>

          <Input
            label="User ID"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter 8-character User ID"
            maxLength={8}
            required
            disabled={isLoading || failedAttempts >= 3}
          />

          <Input
            label="Last 4 Digits of SSN"
            type="password"
            value={ssnLast4}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setSsnLast4(value);
            }}
            placeholder="Enter last 4 digits"
            maxLength={4}
            required
            disabled={isLoading || failedAttempts >= 3}
          />

          {failedAttempts > 0 && failedAttempts < 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                Failed attempts: {failedAttempts} of 3
              </p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="large"
            isLoading={isLoading}
            disabled={failedAttempts >= 3}
            className="w-full"
          >
            Verify Identity
          </Button>
        </form>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </button>

          <p className="text-xs text-gray-500">
            Need assistance? Contact help desk at (800) 555-0100
          </p>
        </div>
      </div>
    </div>
  );
}
