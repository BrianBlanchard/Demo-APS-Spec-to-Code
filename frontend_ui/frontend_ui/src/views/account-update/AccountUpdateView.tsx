import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Card } from '../../components/card';
import { Alert } from '../../components/alert';

interface AccountData {
  accountId: string;
  creditLimit: number;
  cashCreditLimit: number;
  accountStatus: 'ACTIVE' | 'INACTIVE';
  currentBalance: number;
  ficoScore: number;
}

export default function AccountUpdateView() {
  const { accountNumber } = useParams<{ accountNumber: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [creditLimit, setCreditLimit] = useState('');
  const [cashCreditLimit, setCashCreditLimit] = useState('');
  const [accountStatus, setAccountStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [originalData, setOriginalData] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockData: AccountData = {
      accountId: accountNumber || '',
      creditLimit: 10000.00,
      cashCreditLimit: 2000.00,
      accountStatus: 'ACTIVE',
      currentBalance: -2450.75,
      ficoScore: 725,
    };

    setOriginalData(mockData);
    setCreditLimit(mockData.creditLimit.toString());
    setCashCreditLimit(mockData.cashCreditLimit.toString());
    setAccountStatus(mockData.accountStatus);
  }, [accountNumber]);

  useEffect(() => {
    if (originalData) {
      const hasChanges =
        creditLimit !== originalData.creditLimit.toString() ||
        cashCreditLimit !== originalData.cashCreditLimit.toString() ||
        accountStatus !== originalData.accountStatus;
      setIsDirty(hasChanges);
    }
  }, [creditLimit, cashCreditLimit, accountStatus, originalData]);

  const validateForm = (): boolean => {
    const creditLimitNum = parseFloat(creditLimit);
    const cashLimitNum = parseFloat(cashCreditLimit);

    if (!creditLimit || !cashCreditLimit) {
      setErrorMessage('All fields are required');
      return false;
    }

    if (creditLimitNum < 1000 || creditLimitNum > 100000) {
      setErrorMessage('Credit limit must be between $1,000 and $100,000');
      return false;
    }

    if (cashLimitNum > creditLimitNum) {
      setErrorMessage('Cash credit limit cannot exceed credit limit');
      return false;
    }

    if (originalData && accountStatus === 'INACTIVE' && originalData.currentBalance !== 0) {
      setErrorMessage('Cannot deactivate account with outstanding balance');
      return false;
    }

    // FICO score validation
    if (originalData) {
      const maxLimit = getMaxCreditLimitForFico(originalData.ficoScore);
      if (creditLimitNum > maxLimit) {
        setErrorMessage(`Credit limit exceeds maximum for FICO score ${originalData.ficoScore}: $${maxLimit.toFixed(2)}`);
        return false;
      }
    }

    return true;
  };

  const getMaxCreditLimitForFico = (fico: number): number => {
    if (fico >= 740) return 100000;
    if (fico >= 670) return 25000;
    if (fico >= 580) return 10000;
    return 5000;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Account updated successfully');

      // Show success message then navigate back
      setTimeout(() => {
        navigate(`/accounts/${accountNumber}`);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Failed to update account. Please try again.');
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(`/accounts/${accountNumber}`);
      }
    } else {
      navigate(`/accounts/${accountNumber}`);
    }
  };

  if (!originalData) {
    return null;
  }

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
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="secondary" size="small" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4">
            <Button variant="secondary" size="small" onClick={handleCancel}>
              ← Back to Account Details
            </Button>
          </div>

          <Card title={`Update Account - ${accountNumber}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <Alert variant="error" onClose={() => setErrorMessage('')}>
                  {errorMessage}
                </Alert>
              )}

              {successMessage && (
                <Alert variant="success" onClose={() => setSuccessMessage('')}>
                  {successMessage}
                </Alert>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Changes require confirmation before final commit.
                  All modifications are logged in the audit trail.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Account ID</p>
                  <p className="text-lg font-semibold text-gray-900">{accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">FICO Score</p>
                  <p className="text-lg font-semibold text-gray-900">{originalData.ficoScore}</p>
                </div>
              </div>

              <Input
                label="Credit Limit ($)"
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="Enter credit limit"
                required
                disabled={isLoading}
                step="0.01"
                min="1000"
                max="100000"
              />

              <Input
                label="Cash Credit Limit ($)"
                type="number"
                value={cashCreditLimit}
                onChange={(e) => setCashCreditLimit(e.target.value)}
                placeholder="Enter cash credit limit"
                required
                disabled={isLoading}
                step="0.01"
                min="0"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountStatus"
                      value="ACTIVE"
                      checked={accountStatus === 'ACTIVE'}
                      onChange={(e) => setAccountStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                      disabled={isLoading}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accountStatus"
                      value="INACTIVE"
                      checked={accountStatus === 'INACTIVE'}
                      onChange={(e) => setAccountStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                      disabled={isLoading}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>

              {isDirty && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Changes detected:</strong>
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                    {creditLimit !== originalData.creditLimit.toString() && (
                      <li>Credit Limit: ${originalData.creditLimit.toFixed(2)} → ${parseFloat(creditLimit).toFixed(2)}</li>
                    )}
                    {cashCreditLimit !== originalData.cashCreditLimit.toString() && (
                      <li>Cash Limit: ${originalData.cashCreditLimit.toFixed(2)} → ${parseFloat(cashCreditLimit).toFixed(2)}</li>
                    )}
                    {accountStatus !== originalData.accountStatus && (
                      <li>Status: {originalData.accountStatus} → {accountStatus}</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="medium"
                  isLoading={isLoading}
                  disabled={!isDirty}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="medium"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
