import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Alert } from '../../components/alert';

interface PaymentDetails {
  accountId: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  paymentMethodName: string;
  eftAccountLast4?: string;
  balanceDue: number;
}

export default function PaymentReviewView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const paymentDetails = location.state as PaymentDetails;

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!paymentDetails) {
    navigate('/payments/select-account');
    return null;
  }

  const newBalance = paymentDetails.balanceDue - paymentDetails.amount;
  const availableCredit = 10000 - Math.abs(newBalance); // Mock credit limit

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthorized) {
      setErrorMessage('Please check the authorization box to proceed');
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful response
      const mockPaymentId = 'PAY' + Date.now().toString().slice(-9);
      const mockTransactionId = Date.now().toString().padStart(16, '0');
      const mockConfirmationNumber = 'CONF' + Date.now().toString().slice(-6);

      // Navigate to confirmation screen
      navigate('/payments/confirmation', {
        state: {
          paymentId: mockPaymentId,
          transactionId: mockTransactionId,
          confirmationNumber: mockConfirmationNumber,
          accountId: paymentDetails.accountId,
          amount: paymentDetails.amount,
          paymentMethod: paymentDetails.paymentMethodName,
          eftAccountLast4: paymentDetails.eftAccountLast4,
          previousBalance: -paymentDetails.balanceDue,
          newBalance: -newBalance,
          availableCredit: availableCredit,
        }
      });
    } catch (error: any) {
      setIsSubmitting(false);

      if (error.status === 402) {
        setErrorMessage('Payment failed - Insufficient funds in bank account');
      } else if (error.status === 409) {
        setErrorMessage('Duplicate payment detected. Similar payment submitted recently.');
      } else if (error.status === 422) {
        setErrorMessage('Account balance has changed. Please review and resubmit.');
      } else {
        setErrorMessage('Payment processing error. Your payment was NOT processed. No charges have been made to your account.');
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
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
              ← Back
            </Button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Review Payment
          </h2>

          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card title="Payment Details">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Account ID</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {paymentDetails.accountId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${paymentDetails.amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Type</p>
                    <p className="text-lg text-gray-900">
                      {paymentDetails.paymentType.charAt(0) + paymentDetails.paymentType.slice(1).toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="text-lg text-gray-900">
                      {paymentDetails.paymentMethodName}
                      {paymentDetails.eftAccountLast4 && (
                        <span className="text-sm text-gray-600">
                          {' '}(ending in {paymentDetails.eftAccountLast4})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Current Balance</p>
                      <p className="text-lg font-semibold text-red-600">
                        ${paymentDetails.balanceDue.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment</p>
                      <p className="text-lg font-semibold text-green-600">
                        -${paymentDetails.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">New Balance</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${newBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Available Credit After Payment</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ${availableCredit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Please review all payment details carefully before
                  submitting. Once processed, this transaction cannot be undone.
                </p>
              </div>

              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAuthorized}
                  onChange={(e) => setIsAuthorized(e.target.checked)}
                  disabled={isSubmitting}
                  className={`mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    !isAuthorized && errorMessage ? 'border-red-500 ring-2 ring-red-200' : ''
                  }`}
                />
                <span className="ml-3 text-sm text-gray-700">
                  I authorize this payment and confirm that all information is correct. I understand
                  that this payment will be processed immediately and funds will be withdrawn from
                  the selected payment method.
                </span>
              </label>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                size="large"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="large"
                isLoading={isSubmitting}
                disabled={!isAuthorized}
              >
                {isSubmitting ? 'Processing payment...' : 'Submit Payment'}
              </Button>
            </div>
          </form>

          {isSubmitting && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
              <Card className="max-w-md">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg font-semibold text-gray-900">Processing payment...</p>
                  <p className="text-sm text-gray-600 mt-2">Please do not close this window</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
