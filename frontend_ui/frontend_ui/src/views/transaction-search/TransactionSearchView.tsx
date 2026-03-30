import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card } from '@/components/card';
import { Alert } from '@/components/alert';

interface TransactionResult {
  transactionId: string;
  cardNumber: string;
  accountId: string;
  amount: number;
  transactionType: string;
  transactionTypeDescription: string;
  merchantName: string;
  timestamp: string;
  status: 'APPROVED' | 'DECLINED' | 'REVERSED';
}

interface SearchSummary {
  totalAmount: number;
  averageAmount: number;
  transactionCount: number;
}

export default function TransactionSearchView() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [cardLast4, setCardLast4] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [searchResults, setSearchResults] = useState<TransactionResult[]>([]);
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const transactionTypes = [
    { code: '', name: 'All Types' },
    { code: '01', name: 'Purchase' },
    { code: '02', name: 'Payment' },
    { code: '03', name: 'Cash Advance' },
    { code: '04', name: 'Fee' },
    { code: '05', name: 'Interest' },
    { code: '06', name: 'Adjustment' },
  ];

  const validateSearch = (): boolean => {
    if (!dateFrom && !dateTo && !cardLast4 && !transactionType && !amountMin && !amountMax) {
      setErrorMessage('At least one search criterion must be provided');
      return false;
    }

    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);

      if (to < from) {
        setErrorMessage('End date must be after start date');
        return false;
      }

      const daysDiff = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        setErrorMessage('Date range cannot exceed 1 year');
        return false;
      }
    }

    if (cardLast4 && cardLast4.length !== 4) {
      setErrorMessage('Card last 4 must be exactly 4 digits');
      return false;
    }

    if (amountMin && amountMax) {
      const min = parseFloat(amountMin);
      const max = parseFloat(amountMax);
      if (min > max) {
        setErrorMessage('Minimum amount must be less than maximum amount');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateSearch()) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock results
      const mockResults: TransactionResult[] = [
        {
          transactionId: '1234567890123456',
          cardNumber: '****9012',
          accountId: '12345678901',
          amount: 125.50,
          transactionType: '01',
          transactionTypeDescription: 'Purchase',
          merchantName: 'Best Buy Store #1234',
          timestamp: '2024-01-15T14:35:00Z',
          status: 'APPROVED',
        },
        {
          transactionId: '1234567890123457',
          cardNumber: '****9012',
          accountId: '12345678901',
          amount: 2450.75,
          transactionType: '02',
          transactionTypeDescription: 'Payment',
          merchantName: 'N/A',
          timestamp: '2024-01-16T10:20:00Z',
          status: 'APPROVED',
        },
        {
          transactionId: '1234567890123458',
          cardNumber: '****9012',
          accountId: '12345678901',
          amount: 45.00,
          transactionType: '01',
          transactionTypeDescription: 'Purchase',
          merchantName: 'Gas Station',
          timestamp: '2024-01-18T08:15:00Z',
          status: 'APPROVED',
        },
      ];

      setSearchResults(mockResults);
      setSummary({
        totalAmount: 2621.25,
        averageAmount: 873.75,
        transactionCount: mockResults.length,
      });
    } catch (error) {
      setErrorMessage('Search failed. Please try again.');
      setSearchResults([]);
      setSummary(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearFilters = () => {
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);

    setDateFrom(defaultFrom.toISOString().split('T')[0]);
    setDateTo(new Date().toISOString().split('T')[0]);
    setCardLast4('');
    setTransactionType('');
    setAmountMin('');
    setAmountMax('');
    setSearchResults([]);
    setSummary(null);
    setErrorMessage('');
    setHasSearched(false);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'REVERSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
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
            <Button variant="secondary" size="small" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Transaction Search
          </h2>

          <Card title="Search Criteria">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <Alert variant="error" onClose={() => setErrorMessage('')}>
                  {errorMessage}
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="From Date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  disabled={isSearching}
                />

                <Input
                  label="To Date"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  disabled={isSearching}
                />

                <Input
                  label="Card Last 4 Digits"
                  type="text"
                  value={cardLast4}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setCardLast4(value);
                  }}
                  placeholder="Enter last 4 digits"
                  maxLength={4}
                  disabled={isSearching}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                  </label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    disabled={isSearching}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {transactionTypes.map((type) => (
                      <option key={type.code} value={type.code}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Minimum Amount ($)"
                  type="number"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                  placeholder="Min amount"
                  step="0.01"
                  disabled={isSearching}
                />

                <Input
                  label="Maximum Amount ($)"
                  type="number"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                  placeholder="Max amount"
                  step="0.01"
                  disabled={isSearching}
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  isLoading={isSearching}
                  className="flex-1"
                >
                  Search Transactions
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={handleClearFilters}
                  disabled={isSearching}
                  className="flex-1"
                >
                  Clear Filters
                </Button>
              </div>
            </form>
          </Card>

          {hasSearched && (
            <>
              {summary && (
                <Card className="mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Found {summary.transactionCount} transactions totaling ${summary.totalAmount.toFixed(2)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Average: ${summary.averageAmount.toFixed(2)}
                    </p>
                  </div>
                </Card>
              )}

              {searchResults.length === 0 ? (
                <Card className="mt-6">
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No transactions found matching your criteria</p>
                    <Button variant="primary" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="mt-6">
                  <Card title="Search Results">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date/Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Card
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Merchant
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {searchResults.map((result) => (
                            <tr key={result.transactionId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(result.timestamp)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                {result.transactionId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                {result.cardNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {result.transactionTypeDescription}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {result.merchantName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                                ${result.amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(result.status)}`}>
                                  {result.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
