import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/button';
import { Card } from '../../components/card';

export default function AccountDetailView() {
  const { accountNumber } = useParams<{ accountNumber: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mock data - in real app, this would be fetched from API
  const accountData = {
    accountNumber: accountNumber || '',
    accountType: 'Savings',
    accountStatus: 'Active',
    customerId: 'CUST001',
    customerName: 'John Doe',
    balance: 15420.50,
    availableBalance: 15420.50,
    currency: 'USD',
    openDate: '2023-01-15',
    lastActivityDate: '2024-03-20',
    interestRate: 2.5,
  };

  const handleBack = () => {
    navigate('/accounts/search');
  };

  const handleUpdate = () => {
    navigate(`/accounts/${accountNumber}/update`);
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
          <div className="mb-4 flex justify-between items-center">
            <Button variant="secondary" size="small" onClick={handleBack}>
              ← Back to Search
            </Button>
            <Button variant="primary" size="small" onClick={handleUpdate}>
              Update Account
            </Button>
          </div>

          <Card title="Account Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Account Number</h3>
                <p className="mt-1 text-lg text-gray-900">{accountData.accountNumber}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                <p className="mt-1 text-lg text-gray-900">{accountData.accountType}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-lg text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {accountData.accountStatus}
                  </span>
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer ID</h3>
                <p className="mt-1 text-lg text-gray-900">{accountData.customerId}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Name</h3>
                <p className="mt-1 text-lg text-gray-900">{accountData.customerName}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Balance</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  ${accountData.balance.toFixed(2)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Available Balance</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  ${accountData.availableBalance.toFixed(2)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Currency</h3>
                <p className="mt-1 text-lg text-gray-900">{accountData.currency}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Open Date</h3>
                <p className="mt-1 text-lg text-gray-900">{accountData.openDate}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Activity</h3>
                <p className="mt-1 text-lg text-gray-900">{accountData.lastActivityDate}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Interest Rate</h3>
                <p className="mt-1 text-lg text-gray-900">{accountData.interestRate}%</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
