import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

// Views (to be imported as we create them)
import LoginView from './views/login/LoginView';
import DashboardView from './views/dashboard/DashboardView';
import AccountSearchView from './views/account-search/AccountSearchView';
import AccountDetailView from './views/account-detail/AccountDetailView';
import AccountSearchResultsView from './views/account-search-results/AccountSearchResultsView';
import AccountUpdateView from './views/account-update/AccountUpdateView';
import NewPasswordView from './views/new-password/NewPasswordView';
import PasswordResetView from './views/password-reset/PasswordResetView';
import PaymentAccountSelectionView from './views/payment-account-selection/PaymentAccountSelectionView';
import PaymentAmountView from './views/payment-amount/PaymentAmountView';
import PaymentReviewView from './views/payment-review/PaymentReviewView';
import PaymentConfirmationView from './views/payment-confirmation/PaymentConfirmationView';
import TransactionEntryView from './views/transaction-entry/TransactionEntryView';
import TransactionConfirmationView from './views/transaction-confirmation/TransactionConfirmationView';
import TransactionSearchView from './views/transaction-search/TransactionSearchView';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/dashboard" element={<DashboardView />} />

            {/* Account Routes */}
            <Route path="/accounts/search" element={<AccountSearchView />} />
            <Route path="/accounts/search/results" element={<AccountSearchResultsView />} />
            <Route path="/accounts/:accountNumber" element={<AccountDetailView />} />
            <Route path="/accounts/:accountNumber/update" element={<AccountUpdateView />} />

            {/* Password Reset Routes */}
            <Route path="/password-reset" element={<PasswordResetView />} />
            <Route path="/auth/password-reset/new-password" element={<NewPasswordView />} />

            {/* Payment Routes */}
            <Route path="/payments/select-account" element={<PaymentAccountSelectionView />} />
            <Route path="/payments/amount/:accountId" element={<PaymentAmountView />} />
            <Route path="/payments/review" element={<PaymentReviewView />} />
            <Route path="/payments/confirmation" element={<PaymentConfirmationView />} />

            {/* Transaction Routes */}
            <Route path="/transactions/entry" element={<TransactionEntryView />} />
            <Route path="/transactions/confirmation" element={<TransactionConfirmationView />} />
            <Route path="/transactions/search" element={<TransactionSearchView />} />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
