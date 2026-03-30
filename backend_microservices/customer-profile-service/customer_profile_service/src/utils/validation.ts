import { UnprocessableEntityError, ValidationError } from '../exceptions/AppError';

export function validateCustomerId(customerId: string): void {
  if (!/^\d{9}$/.test(customerId)) {
    throw new ValidationError('Customer ID must be exactly 9 digits');
  }
}

export function validateStateZipCode(state: string, zipCode: string): void {
  const stateZipPrefixes: Record<string, string[]> = {
    IL: ['60', '61', '62'],
    NY: ['10', '11', '12', '13', '14'],
    CA: ['90', '91', '92', '93', '94', '95', '96'],
    TX: ['75', '76', '77', '78', '79'],
    FL: ['32', '33', '34'],
  };

  const zipPrefix = zipCode.substring(0, 2);
  const validPrefixes = stateZipPrefixes[state];

  if (validPrefixes && !validPrefixes.includes(zipPrefix)) {
    throw new UnprocessableEntityError(
      `New ZIP code ${zipCode} does not match state ${state}, expected ${state} prefix ${validPrefixes.join(', ')}`,
      { state, zipCode, expectedPrefixes: validPrefixes.join(', ') }
    );
  }
}

export function validatePhoneNumber(phone: string): void {
  // Basic phone validation (US format)
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError(`Invalid phone number format: ${phone}. Expected format: XXX-XXX-XXXX`);
  }
}

export function validateUpdatePermissions(
  fieldName: string,
  role: string
): void {
  const restrictedFields = ['ssn', 'date_of_birth', 'fico_score', 'government_id'];

  if (restrictedFields.includes(fieldName) && role !== 'ADMIN') {
    throw new UnprocessableEntityError(
      `This field (${fieldName}) cannot be modified via self-service`
    );
  }
}
