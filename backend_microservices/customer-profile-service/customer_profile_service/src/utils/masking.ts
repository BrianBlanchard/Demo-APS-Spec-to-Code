import { UserRole } from '../types/dtos';

export function maskSSN(ssn: string, role: UserRole): string {
  if (role === UserRole.ADMIN) {
    return ssn;
  }

  if (role === UserRole.CSR) {
    // Show last 4 digits: ***-**-6789
    return `***-**-${ssn.slice(-4)}`;
  }

  // CUSTOMER or other roles - full mask
  return '***-**-****';
}

export function maskGovernmentId(governmentId: string, role: UserRole): string {
  if (role === UserRole.ADMIN) {
    return governmentId;
  }

  // Partial mask for all non-admin roles
  const visibleLength = Math.min(5, governmentId.length);
  const masked = '*'.repeat(Math.max(0, governmentId.length - visibleLength));
  return masked + governmentId.slice(-visibleLength);
}

export function shouldShowFicoScore(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

export function maskSensitiveData(value: string): string {
  if (value.length <= 4) {
    return '*'.repeat(value.length);
  }
  return '*'.repeat(value.length - 4) + value.slice(-4);
}
