import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card } from '@/components/card';
import { Alert } from '@/components/alert';

export default function AccountSearchView() {
  const [accountNumber, setAccountNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // For demo purposes, navigate to account detail
    if (accountNumber) {
      navigate(`/accounts/${accountNumber}`);
    } else {
      setErrorMessage('Please enter at least one search criteria');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
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

          <Card title="Account Search">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <Alert variant="error" onClose={() => setErrorMessage('')}>
                  {errorMessage}
                </Alert>
              )}

              <Input
                label="Account Number"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
              />

              <Input
                label="Customer ID"
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Enter customer ID"
              />

              <Input
                label="Customer Name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="medium"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Search
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="medium"
                  onClick={() => {
                    setAccountNumber('');
                    setCustomerId('');
                    setCustomerName('');
                  }}
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
