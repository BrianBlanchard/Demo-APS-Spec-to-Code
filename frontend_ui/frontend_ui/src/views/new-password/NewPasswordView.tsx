import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Alert } from '../../components/alert';

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export default function NewPasswordView() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');
  const [requirementsMet, setRequirementsMet] = useState<PasswordRequirements>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [tokenExpiry, setTokenExpiry] = useState(900); // 15 minutes in seconds

  useEffect(() => {
    // Token expiry countdown
    const timer = setInterval(() => {
      setTokenExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMessage('Reset token expired. Redirecting to verification...');
          setTimeout(() => navigate('/password-reset'), 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  useEffect(() => {
    // Validate password requirements in real-time
    const requirements: PasswordRequirements = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*]/.test(newPassword),
    };

    setRequirementsMet(requirements);

    // Calculate password strength
    const metCount = Object.values(requirements).filter(Boolean).length;
    if (metCount <= 2) {
      setPasswordStrength('Weak');
    } else if (metCount <= 4) {
      setPasswordStrength('Medium');
    } else {
      setPasswordStrength('Strong');
    }
  }, [newPassword]);

  const allRequirementsMet = (): boolean => {
    return Object.values(requirementsMet).every(Boolean);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!allRequirementsMet()) {
      setErrorMessage('Please meet all password requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      setConfirmPassword('');
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success - navigate to login
      navigate('/login', {
        state: { message: 'Password reset successfully. Please login with your new password.' }
      });
    } catch (error: any) {
      setIsLoading(false);
      if (error.status === 401) {
        setErrorMessage('Reset token expired. Please restart password reset process.');
        setTimeout(() => navigate('/password-reset'), 3000);
      } else if (error.status === 409) {
        setErrorMessage('Password cannot be the same as your last 5 passwords. Choose a different password.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage('Failed to reset password. Please try again.');
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'Strong': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Set New Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a strong password for your account
          </p>
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Token expires in: <span className="font-semibold">{formatTime(tokenExpiry)}</span>
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}

          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
            disabled={isLoading}
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            disabled={isLoading}
            autoComplete="new-password"
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showPassword" className="ml-2 block text-sm text-gray-700">
              Show password
            </label>
          </div>

          {newPassword && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-700">
                  Password Strength: <span className={`font-semibold ${getStrengthColor()}`}>{passwordStrength}</span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                <ul className="space-y-1">
                  <li className={`text-xs flex items-center ${requirementsMet.length ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{requirementsMet.length ? '✓' : '○'}</span>
                    At least 8 characters
                  </li>
                  <li className={`text-xs flex items-center ${requirementsMet.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{requirementsMet.uppercase ? '✓' : '○'}</span>
                    At least one uppercase letter
                  </li>
                  <li className={`text-xs flex items-center ${requirementsMet.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{requirementsMet.lowercase ? '✓' : '○'}</span>
                    At least one lowercase letter
                  </li>
                  <li className={`text-xs flex items-center ${requirementsMet.number ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{requirementsMet.number ? '✓' : '○'}</span>
                    At least one number
                  </li>
                  <li className={`text-xs flex items-center ${requirementsMet.special ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className="mr-2">{requirementsMet.special ? '✓' : '○'}</span>
                    At least one special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="large"
            isLoading={isLoading}
            disabled={!allRequirementsMet() || !confirmPassword}
            className="w-full"
          >
            Reset Password
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
