import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card } from '@/components/card';
import { Alert } from '@/components/alert';

interface TransactionType {
  code: string;
  name: string;
  categoryCode: string;
  requiresMerchant: boolean;
}

interface CardDetails {
  cardHolder: string;
  accountId: string;
  availableCredit: number;
  status: string;
}

export default function TransactionEntryView() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const transactionTypes: TransactionType[] = [
    { code: '01', name: 'Purchase', categoryCode: '0001', requiresMerchant: true },
    { code: '02', name: 'Payment', categoryCode: '0002', requiresMerchant: false },
    { code: '03', name: 'Cash Advance', categoryCode: '0003', requiresMerchant: false },
    { code: '04', name: 'Fee', categoryCode: '0004', requiresMerchant: false },
    { code: '05', name: 'Interest', categoryCode: '0005', requiresMerchant: false },
    { code: '06', name: 'Adjustment', categoryCode: '0006', requiresMerchant: false },
  ];

  const [cardNumber, setCardNumber] = useState('');
  const [transactionType, setTransactionType] = useState('01');
  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [merchantCity, setMerchantCity] = useState('');
  const [merchantZip, setMerchantZip] = useState('');
  const [description, setDescription] = useState('');
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMerchantFields, setShowMerchantFields] = useState(true);

  const selectedType = transactionTypes.find(t => t.code === transactionType);

  useEffect(() => {
    setShowMerchantFields(selectedType?.requiresMerchant || false);
  }, [transactionType, selectedType]);

  useEffect(() => {
    // Auto-lookup card after 16 digits entered
    if (cardNumber.length === 16) {
      lookupCard();
    } else {
      setCardDetails(null);
    }
  }, [cardNumber]);

  const lookupCard = async () => {
    try {
      // Mock card lookup
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockCardDetails: CardDetails = {
        cardHolder: 'John Smith',
        accountId: '12345678901',
        availableCredit: 7549.25,
        status: 'ACTIVE',
      };

      setCardDetails(mockCardDetails);
    } catch (error) {
      setErrorMessage('Card not found. Please verify the card number.');
      setCardDetails(null);
    }
  };

  const validateForm = (): boolean => {
    if (cardNumber.length !== 16) {
      setErrorMessage('Card number must be exactly 16 digits');
      return false;
    }

    if (!cardDetails) {
      setErrorMessage('Please enter a valid card number');
      return false;
    }

    if (cardDetails.status !== 'ACTIVE') {
      setErrorMessage('DECLINED - Card is inactive');
      return false;
    }

    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0) {
      setErrorMessage('Amount must be greater than $0');
      return false;
    }

    if (amountNum > 999999.99) {
      setErrorMessage('Amount exceeds maximum transaction limit');
      return false;
    }

    if ((transactionType === '01' || transactionType === '03') && amountNum > cardDetails.availableCredit) {
      setErrorMessage(`DECLINED - Insufficient credit. Available: $${cardDetails.availableCredit.toFixed(2)} | Requested: $${amountNum.toFixed(2)}`);
      return false;
    }

    if (showMerchantFields && (!merchantName || !merchantCity || !merchantZip)) {
      setErrorMessage('Merchant information required for purchase transactions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful response
      const mockTransactionId = Date.now().toString().padStart(16, '0');
      const mockAuthCode = 'AUTH' + Date.now().toString().slice(-6);

      // Navigate to confirmation screen
      navigate('/transactions/confirmation', {
        state: {
          transactionId: mockTransactionId,
          cardNumber: cardNumber,
          amount: parseFloat(amount),
          transactionType: transactionType,
          transactionTypeDescription: selectedType?.name,
          merchantName: merchantName || 'N/A',
          authorizationCode: mockAuthCode,
          timestamp: new Date().toISOString(),
          status: 'APPROVED',
        }
      });
    } catch (error: any) {
      setIsSubmitting(false);

      if (error.status === 404) {
        setErrorMessage('Card number not found. Please verify and try again.');
      } else if (error.status === 403) {
        setErrorMessage('DECLINED - Card is inactive');
      } else if (error.status === 410) {
        setErrorMessage('DECLINED - Card expired');
      } else if (error.status === 409) {
        setErrorMessage('Possible duplicate transaction detected. Proceed anyway?');
      } else {
        setErrorMessage('Transaction processing error. Please try again.');
      }
    }
  };

  const handleClear = () => {
    setCardNumber('');
    setAmount('');
    setMerchantName('');
    setMerchantCity('');
    setMerchantZip('');
    setDescription('');
    setCardDetails(null);
    setErrorMessage('');
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
            <Button variant="secondary" size="small" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>

          <Card title="Transaction Entry">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <Alert variant="error" onClose={() => setErrorMessage('')}>
                  {errorMessage}
                </Alert>
              )}

              <Input
                label="Card Number"
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setCardNumber(value);
                }}
                placeholder="Enter 16-digit card number"
                maxLength={16}
                required
                disabled={isSubmitting}
              />

              {cardDetails && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-green-800">Card Holder</p>
                      <p className="font-semibold text-green-900">{cardDetails.cardHolder}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-800">Available Credit</p>
                      <p className="font-semibold text-green-900">
                        ${cardDetails.availableCredit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  disabled={isSubmitting}
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
                label="Amount ($)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
                disabled={isSubmitting}
                step="0.01"
                min="0.01"
                max="999999.99"
              />

              {showMerchantFields && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Merchant Information
                  </h3>

                  <div className="space-y-4">
                    <Input
                      label="Merchant Name"
                      type="text"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      placeholder="Enter merchant name"
                      required={showMerchantFields}
                      disabled={isSubmitting}
                      maxLength={100}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        type="text"
                        value={merchantCity}
                        onChange={(e) => setMerchantCity(e.target.value)}
                        placeholder="Enter city"
                        required={showMerchantFields}
                        disabled={isSubmitting}
                        maxLength={50}
                      />

                      <Input
                        label="ZIP Code"
                        type="text"
                        value={merchantZip}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setMerchantZip(value);
                        }}
                        placeholder="Enter ZIP"
                        required={showMerchantFields}
                        disabled={isSubmitting}
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Input
                label="Description (Optional)"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter transaction description"
                disabled={isSubmitting}
                maxLength={100}
              />

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  isLoading={isSubmitting}
                  disabled={!cardDetails}
                  className="flex-1"
                >
                  Submit Transaction
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={handleClear}
                  disabled={isSubmitting}
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
