import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/button';
import { Card } from '@/components/card';

interface TransactionData {
  transactionId: string;
  cardNumber: string;
  amount: number;
  transactionType: string;
  transactionTypeDescription: string;
  merchantName: string;
  authorizationCode: string;
  timestamp: string;
  status: string;
}

export default function TransactionConfirmationView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const transactionData = location.state as TransactionData;

  if (!transactionData) {
    navigate('/transactions/entry');
    return null;
  }

  const cardNumberMasked = '****' + transactionData.cardNumber.slice(-4);
  const formattedDate = new Date(transactionData.timestamp).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Mock account data
  const previousBalance = -2450.75;
  const newBalance = previousBalance - transactionData.amount;
  const creditLimit = 10000.00;
  const availableCredit = creditLimit - Math.abs(newBalance);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleNewTransaction = () => {
    navigate('/transactions/entry');
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
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              APPROVED
            </h2>
            <p className="text-lg text-gray-600">
              Transaction processed successfully
            </p>
          </div>

          <Card title="Transaction Details">
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="text-center">
                  <p className="text-sm text-green-800 mb-1">Transaction ID</p>
                  <p className="text-2xl font-mono font-bold text-green-900">
                    {transactionData.transactionId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Card Number</p>
                  <p className="text-lg font-mono text-gray-900">
                    {cardNumberMasked}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${transactionData.amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Transaction Type</p>
                  <p className="text-lg text-gray-900">
                    {transactionData.transactionTypeDescription}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Authorization Code</p>
                  <p className="text-lg font-mono text-gray-900">
                    {transactionData.authorizationCode}
                  </p>
                </div>

                {transactionData.merchantName !== 'N/A' && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Merchant</p>
                    <p className="text-lg text-gray-900">
                      {transactionData.merchantName}
                    </p>
                  </div>
                )}

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="text-lg text-gray-900">{formattedDate}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Updated Account Balance
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">New Balance</p>
                    <p className="text-xl font-bold text-red-600">
                      ${Math.abs(newBalance).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Available Credit</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ${availableCredit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Receipt:</strong> This transaction confirmation serves as your receipt.
                  Keep this information for your records.
                </p>
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
              onClick={handleNewTransaction}
              className="w-full"
            >
              New Transaction
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
        </div>
      </main>
    </div>
  );
}
