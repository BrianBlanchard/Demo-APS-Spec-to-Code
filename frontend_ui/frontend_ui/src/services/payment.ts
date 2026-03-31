import apiClient from './api';
import type { Payment, PaymentConfirmation } from '../types/payment';

// Payment service
export const paymentService = {
  // Create payment
  createPayment: async (payment: Payment): Promise<PaymentConfirmation> => {
    const response = await apiClient.post<PaymentConfirmation>('/api/v1/payments', payment);
    return response.data;
  },

  // Get payment details
  getPaymentDetail: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/api/v1/payments/${paymentId}`);
    return response.data;
  },

  // Validate payment
  validatePayment: async (payment: Payment): Promise<{ valid: boolean; errors?: string[] }> => {
    const response = await apiClient.post('/api/v1/payments/validate', payment);
    return response.data;
  },
};
