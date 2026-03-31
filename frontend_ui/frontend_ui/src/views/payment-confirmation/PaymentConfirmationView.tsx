import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/button';
import { Card } from '../../components/card';

interface PaymentConfirmationData {
  paymentId: string;
  transactionId: string;
  confirmationNumber: string;
  accountId: string;
  amount: number;
  paymentMethod: string;
  eftAccountLast4?: string;
  previousBalance: number;
  newBalance: number;
  availableCredit: number;
}

export default function PaymentConfirmationView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const confirmationData = location.state as PaymentConfirmationData;

  if (!confirmationData) {
    navigate('/payments/select-account');
    return null;
  }

  const processingDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleMakeAnotherPayment = () => {
    navigate('/payments/select-account');
  };


  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm print:hidden">
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful
            </h2>
            <p className="text-lg text-gray-600">
              Your payment has been processed successfully
            </p>
          </div>

          <Card title="Payment Confirmation">
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="text-center">
                  <p className="text-sm text-green-800 mb-1">Confirmation Number</p>
                  <p className="text-3xl font-bold text-green-900">
                    {confirmationData.confirmationNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="text-lg font-mono text-gray-900">
                    {confirmationData.transactionId}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Payment ID</p>
                  <p className="text-lg font-mono text-gray-900">
                    {confirmationData.paymentId}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Account ID</p>
                  <p className="text-lg text-gray-900">
                    {confirmationData.accountId}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Processing Date</p>
                  <p className="text-lg text-gray-900">{processingDate}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Payment Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${confirmationData.amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-lg text-gray-900">
                    {confirmationData.paymentMethod}
                    {confirmationData.eftAccountLast4 && (
                      <span className="text-sm text-gray-600">
                        {' '}(ending in {confirmationData.eftAccountLast4})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Balance Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Previous Balance</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${Math.abs(confirmationData.previousBalance).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment</p>
                    <p className="text-lg font-semibold text-green-600">
                      -${confirmationData.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">New Balance</p>
                    <p className={`text-lg font-bold ${
                      confirmationData.newBalance === 0
                        ? 'text-green-600'
                        : 'text-gray-900'
                    }`}>
                      ${Math.abs(confirmationData.newBalance).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">Available Credit</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ${confirmationData.availableCredit.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Email Confirmation Sent</p>
                    <p className="text-xs text-blue-700 mt-1">
                      A confirmation email has been sent to {user?.email || 'your registered email address'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
            <Button
              variant="secondary"
              size="large"
              onClick={handlePrintReceipt}
              className="w-full"
            >
              Print Receipt
            </Button>
            <Button
              variant="primary"
              size="large"
              onClick={handleMakeAnotherPayment}
              className="w-full"
            >
              Make Another Payment
            </Button>
            <Button
              variant="secondary"
              size="large"
              onClick={handleBackToDashboard}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600 print:hidden">
            <p>Keep this confirmation number for your records</p>
          </div>
        </div>
      </main>
    </div>
  );
}
