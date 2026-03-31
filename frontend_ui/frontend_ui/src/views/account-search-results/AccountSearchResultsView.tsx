import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Alert } from '../../components/alert';

interface SearchResult {
  accountId: string;
  customerId: string;
  customerName: string;
  accountStatus: 'ACTIVE' | 'INACTIVE';
  currentBalance: number;
  creditLimit: number;
  availableCredit: number;
  openDate: string;
}

interface PaginationInfo {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function AccountSearchResultsView() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalRecords: 0,
    currentPage: 1,
    totalPages: 0,
    pageSize: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Mock data for demonstration
    const mockResults: SearchResult[] = [
      {
        accountId: '12345678901',
        customerId: '123456789',
        customerName: 'John Smith',
        accountStatus: 'ACTIVE',
        currentBalance: -2450.75,
        creditLimit: 10000.00,
        availableCredit: 7549.25,
        openDate: '2022-03-15',
      },
      {
        accountId: '12345678902',
        customerId: '123456790',
        customerName: 'Jane Doe',
        accountStatus: 'ACTIVE',
        currentBalance: -1250.00,
        creditLimit: 5000.00,
        availableCredit: 3750.00,
        openDate: '2023-01-10',
      },
      {
        accountId: '12345678903',
        customerId: '123456791',
        customerName: 'Bob Johnson',
        accountStatus: 'INACTIVE',
        currentBalance: 0.00,
        creditLimit: 8000.00,
        availableCredit: 8000.00,
        openDate: '2021-06-20',
      },
    ];

    setSearchResults(mockResults);
    setPagination({
      totalRecords: 45,
      currentPage: 1,
      totalPages: 3,
      pageSize: 20,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  }, []);

  const handleAccountClick = (accountId: string) => {
    navigate(`/accounts/${accountId}`);
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1,
        hasPreviousPage: prev.currentPage - 1 > 1,
        hasNextPage: true,
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1,
        hasPreviousPage: true,
        hasNextPage: prev.currentPage + 1 < prev.totalPages,
      }));
    }
  };

  const handleBackToSearch = () => {
    navigate('/accounts/search');
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4">
            <Button variant="secondary" size="small" onClick={handleBackToSearch}>
              ← Back to Search
            </Button>
          </div>

          {errorMessage && (
            <Alert variant="error" onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results ({pagination.totalRecords} accounts)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
          </div>

          {searchResults.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">No accounts found</p>
                <p className="text-gray-500 mb-6">Try a different search</p>
                <Button variant="primary" onClick={handleBackToSearch}>
                  Back to Search
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {searchResults.map((account) => (
                <Card
                  key={account.accountId}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    account.accountStatus === 'INACTIVE' ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => handleAccountClick(account.accountId)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {account.accountId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {account.customerName}
                        {' • '}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            account.accountStatus === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-300 text-gray-800'
                          }`}
                        >
                          {account.accountStatus}
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Current Balance</p>
                      <p
                        className={`text-xl font-semibold ${
                          account.currentBalance < 0
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        ${Math.abs(account.currentBalance).toFixed(2)}
                        {account.currentBalance < 0 && ' owed'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Available Credit</p>
                      <p className="text-xl font-semibold text-gray-900">
                        ${account.availableCredit.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Limit: ${account.creditLimit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <Button
                variant="secondary"
                onClick={handlePreviousPage}
                disabled={!pagination.hasPreviousPage || isLoading}
              >
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <Button
                variant="secondary"
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
