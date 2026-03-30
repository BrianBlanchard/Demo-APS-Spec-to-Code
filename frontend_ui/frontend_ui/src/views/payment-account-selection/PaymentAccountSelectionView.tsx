import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card } from '@/components/card';
import { Alert } from '@/components/alert';

interface PaymentAccount {
  accountId: string;
  accountHolder: string;
  currentBalance: number;
  balanceDue: number;
  minimumPayment: number;
  dueDate: string;
  isOverdue: boolean;
  accountStatus: 'ACTIVE' | 'INACTIVE';
}

export default function PaymentAccountSelectionView() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [manualAccountId, setManualAccountId] = useState('');
  const [allowManualEntry, setAllowManualEntry] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Mock data - in real app, fetch from API based on user type
    const mockAccounts: PaymentAccount[] = [
      {
        accountId: '12345678901',
        accountHolder: 'John Smith',
        currentBalance: -2450.75,
        balanceDue: 2450.75,
        minimumPayment: 49.02,
        dueDate: '2024-02-05',
        isOverdue: false,
        accountStatus: 'ACTIVE',
      },
      {
        accountId: '12345678902',
        accountHolder: 'John Smith',
        currentBalance: -850.00,
        balanceDue: 850.00,
        minimumPayment: 25.00,
        dueDate: '2024-01-25',
        isOverdue: true,
        accountStatus: 'ACTIVE',
      },
    ];

    setAccounts(mockAccounts);
    setAllowManualEntry(user?.userType === 'CSR' || user?.userType === 'ADMIN');
    setIsLoading(false);
  }, [user]);

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const handleContinue = () => {
    const accountId = selectedAccountId || manualAccountId;

    if (!accountId) {
      setErrorMessage('Please select an account or enter an account ID');
      return;
    }

    if (manualAccountId && manualAccountId.length !== 11) {
      setErrorMessage('Account ID must be exactly 11 digits');
      return;
    }

    navigate(`/payments/amount/${accountId}`);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getDaysOverdue = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
            <Button variant="secondary" size="small" onClick={handleBack}>
              ← Back to Dashboard
            </Button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Select Account for Payment
          </h2>

          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}

          {isLoading ? (
            <Card>
              <p className="text-center text-gray-600">Loading accounts...</p>
            </Card>
          ) : accounts.length === 0 && !allowManualEntry ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">No accounts found for this user</p>
                <p className="text-gray-500 mb-6">Please contact help desk for assistance</p>
                <p className="text-sm text-gray-600">Help Desk: (800) 555-0100</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {accounts.length > 0 && (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <Card
                      key={account.accountId}
                      className={`cursor-pointer transition-all ${
                        selectedAccountId === account.accountId
                          ? 'ring-2 ring-blue-500 shadow-lg'
                          : 'hover:shadow-md'
                      } ${account.isOverdue ? 'border-red-300' : ''}`}
                      onClick={() => handleAccountSelect(account.accountId)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {account.accountId}
                            </h3>
                            {account.isOverdue && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {account.accountHolder}
                          </p>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Balance Due</p>
                              <p className={`text-lg font-semibold ${account.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                ${account.balanceDue.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Minimum Payment</p>
                              <p className="text-lg font-semibold text-gray-900">
                                ${account.minimumPayment.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Due Date</p>
                              <p className="text-sm text-gray-900">{account.dueDate}</p>
                              {account.isOverdue && (
                                <p className="text-xs text-red-600">
                                  {getDaysOverdue(account.dueDate)} days overdue
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          <input
                            type="radio"
                            name="selectedAccount"
                            checked={selectedAccountId === account.accountId}
                            onChange={() => handleAccountSelect(account.accountId)}
                            className="h-5 w-5 text-blue-600"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {allowManualEntry && (
                <Card title="Manual Account Entry">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Enter an 11-digit account ID to make a payment
                    </p>
                    <Input
                      label="Account ID"
                      type="text"
                      value={manualAccountId}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setManualAccountId(value);
                        if (value) {
                          setSelectedAccountId(null);
                        }
                      }}
                      placeholder="Enter 11-digit account ID"
                      maxLength={11}
                    />
                  </div>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleContinue}
                  disabled={!selectedAccountId && !manualAccountId}
                >
                  Continue to Payment Amount
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
