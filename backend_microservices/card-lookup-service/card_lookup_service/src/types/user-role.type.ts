export const UserRole = {
  CUSTOMER: 'customer',
  CSR: 'csr',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
