import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Card } from '../../components/card';
import { Alert } from '../../components/alert';

interface PaymentMethod {
  methodCode: string;
  methodName: string;
  eftAccountId?: string;
  accountLast4?: string;
  available: boolean;
}

type PaymentType = 'MINIMUM' | 'FULL' | 'CUSTOM';

export default function PaymentAmountView() {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [balanceDue, setBalanceDue] = useState(0);
  const [minimumPayment, setMinimumPayment] = useState(0);
  const [paymentType, setPaymentType] = useState<PaymentType>('FULL');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('EFT');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockBalance = 2450.75;
    const mockMinimum = Math.max(mockBalance * 0.02, 25);

    setBalanceDue(mockBalance);
    setMinimumPayment(mockMinimum);

    const mockMethods: PaymentMethod[] = [
      {
        methodCode: 'EFT',
        methodName: 'Electronic Transfer',
        eftAccountId: 'EFT123456',
        accountLast4: '1234',
        available: true,
      },
      {
        methodCode: 'CHECK',
        methodName: 'Check',
        available: true,
      },
      {
        methodCode: 'CASH',
        methodName: 'Cash (At Branch)',
        available: false,
      },
    ];

    setPaymentMethods(mockMethods);
  }, [accountId]);

  const getSelectedAmount = (): number => {
    switch (paymentType) {
      case 'MINIMUM':
        return minimumPayment;
      case 'FULL':
        return balanceDue;
      case 'CUSTOM':
        return parseFloat(customAmount) || 0;
      default:
        return 0;
    }
  };

  const validateAmount = (): boolean => {
    const amount = getSelectedAmount();

    if (amount <= 0) {
      setErrorMessage('Payment amount must be greater than $0');
      return false;
    }

    if (amount < 25) {
      setErrorMessage('Payment amount must be at least $25.00');
      return false;
    }

    if (amount > balanceDue) {
      setErrorMessage(`Cannot exceed balance of $${balanceDue.toFixed(2)}`);
      return false;
    }

    if (paymentType === 'CUSTOM' && amount < minimumPayment) {
      setWarningMessage(`Warning: Payment is less than minimum payment of $${minimumPayment.toFixed(2)}. Late fees may apply.`);
    } else {
      setWarningMessage('');
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateAmount()) {
      return;
    }

    const selectedMethod = paymentMethods.find(m => m.methodCode === paymentMethod);
    if (!selectedMethod?.available) {
      setErrorMessage('Selected payment method is currently unavailable');
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Navigate to review screen
      navigate('/payments/review', {
        state: {
          accountId,
          amount: getSelectedAmount(),
          paymentType,
          paymentMethod,
          paymentMethodName: selectedMethod.methodName,
          eftAccountLast4: selectedMethod.accountLast4,
          balanceDue,
        }
      });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Failed to process payment. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/payments/select-account');
  };

  const selectedMethod = paymentMethods.find(m => m.methodCode === paymentMethod);

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
              ← Back to Account Selection
            </Button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Select Payment Amount
          </h2>

          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}

          {warningMessage && (
            <Alert variant="warning" onClose={() => setWarningMessage('')}>
              {warningMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card title="Account Summary">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Account ID</p>
                  <p className="text-lg font-semibold text-gray-900">{accountId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Balance Due</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${balanceDue.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Payment Amount">
              <div className="space-y-4">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentType"
                    value="MINIMUM"
                    checked={paymentType === 'MINIMUM'}
                    onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Minimum Payment</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${minimumPayment.toFixed(2)}
                    </p>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentType"
                    value="FULL"
                    checked={paymentType === 'FULL'}
                    onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Full Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${balanceDue.toFixed(2)}
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentType"
                    value="CUSTOM"
                    checked={paymentType === 'CUSTOM'}
                    onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                    className="mr-3 mt-1 h-4 w-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">Custom Amount</p>
                    <Input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setPaymentType('CUSTOM');
                      }}
                      placeholder="Enter custom amount"
                      disabled={paymentType !== 'CUSTOM'}
                      step="0.01"
                      min="25"
                      max={balanceDue}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Min: $25.00 | Max: ${balanceDue.toFixed(2)}
                    </p>
                  </div>
                </label>
              </div>
            </Card>

            <Card title="Payment Method">
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.methodCode}
                    className={`flex items-center p-4 border rounded-lg ${
                      method.available
                        ? 'cursor-pointer hover:bg-gray-50'
                        : 'opacity-50 cursor-not-allowed bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.methodCode}
                      checked={paymentMethod === method.methodCode}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={!method.available}
                      className="mr-3 h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{method.methodName}</p>
                      {method.accountLast4 && (
                        <p className="text-sm text-gray-600">
                          Account ending in {method.accountLast4}
                        </p>
                      )}
                      {!method.available && (
                        <p className="text-xs text-red-600">Currently unavailable</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {selectedMethod?.methodCode === 'EFT' && selectedMethod.accountLast4 && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    Funds will be withdrawn from account ending in {selectedMethod.accountLast4}
                  </p>
                </div>
              )}
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                size="large"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="large"
                isLoading={isLoading}
              >
                Continue to Review
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
