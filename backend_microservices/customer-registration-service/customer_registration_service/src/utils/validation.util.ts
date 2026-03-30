import { UnprocessableEntityError } from '../types/error.types';

export const validateSSN = (ssn: string): void => {
  // Remove dashes for validation
  const ssnDigits = ssn.replace(/-/g, '');

  if (ssnDigits.length !== 9) {
    throw new UnprocessableEntityError('SSN must be 9 digits');
  }

  const firstPart = parseInt(ssnDigits.substring(0, 3), 10);

  // Invalid SSN ranges
  if (firstPart === 0 || firstPart === 666 || (firstPart >= 900 && firstPart <= 999)) {
    throw new UnprocessableEntityError('SSN first part cannot be 000, 666, or 900-999');
  }
};

export const validatePhoneAreaCode = (phone: string): void => {
  // Extract area code (first 3 digits)
  const digits = phone.replace(/\D/g, '');
  const areaCode = parseInt(digits.substring(0, 3), 10);

  // Basic validation for North American area codes
  // Area codes cannot start with 0 or 1
  if (areaCode < 200 || areaCode > 999) {
    throw new UnprocessableEntityError('Invalid phone area code');
  }
};

export const validateStateZipCodeMatch = (state: string, zipCode: string): void => {
  // Basic state/ZIP validation for US addresses
  // This is simplified; production would use a comprehensive mapping
  const zipPrefix = zipCode.substring(0, 2);
  const stateZipMap: Record<string, string[]> = {
    IL: ['60', '61', '62'],
    CA: ['90', '91', '92', '93', '94', '95', '96'],
    NY: ['10', '11', '12', '13', '14'],
    TX: ['75', '76', '77', '78', '79'],
    // Add more states as needed
  };

  if (stateZipMap[state] && !stateZipMap[state].includes(zipPrefix)) {
    throw new UnprocessableEntityError('State code must match ZIP code region');
  }
};

export const validateFicoScore = (score: number): void => {
  if (score < 300 || score > 850) {
    throw new UnprocessableEntityError('FICO score must be between 300 and 850');
  }
};

export const validateAge = (dateOfBirth: string): void => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    // Adjust age if birthday hasn't occurred yet this year
    if (age - 1 < 18) {
      throw new UnprocessableEntityError('Customer must be at least 18 years old');
    }
  } else if (age < 18) {
    throw new UnprocessableEntityError('Customer must be at least 18 years old');
  }
};

export const validateNameField = (name: string, fieldName: string): void => {
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) {
    throw new UnprocessableEntityError(
      `${fieldName} must contain only alphabetic characters and spaces`
    );
  }
};

export const calculateCreditLimit = (ficoScore: number): number => {
  // Credit limit calculation based on FICO score tiers
  if (ficoScore >= 800) {
    return 15000;
  } else if (ficoScore >= 740) {
    return 10000;
  } else if (ficoScore >= 670) {
    return 5000;
  } else if (ficoScore >= 580) {
    return 2000;
  } else {
    return 1000;
  }
};

export const generateCustomerId = (): string => {
  // Generate a unique 9-digit customer ID
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};
