import {
  CreateCustomerRequest,
  CreateCustomerResponse,
  Customer,
  CustomerStatus,
  VerificationStatus,
} from '../types/customer.types';
import { ICustomerRepository } from '../repositories/customer.repository';
import { IAuditService } from './audit.service';
import { ConflictError } from '../types/error.types';
import {
  validateSSN,
  validatePhoneAreaCode,
  validateStateZipCodeMatch,
  validateFicoScore,
  validateAge,
  validateNameField,
  calculateCreditLimit,
  generateCustomerId,
} from '../utils/validation.util';
import { encrypt } from '../utils/encryption.util';
import { logger } from '../config/logger.config';

export interface ICustomerService {
  createCustomer(request: CreateCustomerRequest, userId: string): Promise<CreateCustomerResponse>;
}

export class CustomerService implements ICustomerService {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly auditService: IAuditService
  ) {}

  async createCustomer(
    request: CreateCustomerRequest,
    userId: string
  ): Promise<CreateCustomerResponse> {
    logger.info('Creating new customer');

    // Validate business rules
    validateNameField(request.firstName, 'firstName');
    validateNameField(request.lastName, 'lastName');
    if (request.middleName) {
      validateNameField(request.middleName, 'middleName');
    }

    validateSSN(request.ssn);
    validatePhoneAreaCode(request.phone1);
    if (request.phone2) {
      validatePhoneAreaCode(request.phone2);
    }
    validateStateZipCodeMatch(request.state, request.zipCode);
    validateFicoScore(request.ficoScore);
    validateAge(request.dateOfBirth);

    // Check for duplicates
    const existingBySSN = await this.customerRepository.findBySSN(encrypt(request.ssn));
    if (existingBySSN) {
      this.auditService.log({
        action: 'CREATE_CUSTOMER',
        userId,
        status: 'failure',
        details: { reason: 'Duplicate SSN', customerId: existingBySSN.customerId },
      });

      throw new ConflictError('Customer with this SSN already exists', {
        existingCustomerId: existingBySSN.customerId,
      });
    }

    const existingByGovId = await this.customerRepository.findByGovernmentId(
      encrypt(request.governmentId)
    );
    if (existingByGovId) {
      this.auditService.log({
        action: 'CREATE_CUSTOMER',
        userId,
        status: 'failure',
        details: { reason: 'Duplicate Government ID', customerId: existingByGovId.customerId },
      });

      throw new ConflictError('Customer with this Government ID already exists', {
        existingCustomerId: existingByGovId.customerId,
      });
    }

    // Generate customer ID and calculate credit limit
    const customerId = generateCustomerId();
    const creditLimit = calculateCreditLimit(request.ficoScore);

    // Create customer entity
    const customer: Omit<Customer, 'createdAt' | 'updatedAt'> = {
      customerId,
      firstName: request.firstName,
      middleName: request.middleName,
      lastName: request.lastName,
      dateOfBirth: new Date(request.dateOfBirth),
      ssn: encrypt(request.ssn),
      governmentId: encrypt(request.governmentId),
      addressLine1: request.addressLine1,
      addressLine2: request.addressLine2,
      addressLine3: request.addressLine3,
      city: request.city,
      state: request.state,
      zipCode: request.zipCode,
      country: request.country,
      phone1: request.phone1,
      phone2: request.phone2,
      eftAccountId: request.eftAccountId,
      isPrimaryCardholder: request.isPrimaryCardholder,
      ficoScore: request.ficoScore,
      status: CustomerStatus.ACTIVE,
      verificationStatus: VerificationStatus.PENDING,
      creditLimit,
      createdBy: userId,
      updatedBy: userId,
    };

    // Save to database
    const savedCustomer = await this.customerRepository.create(customer);

    // Audit log success
    this.auditService.log({
      action: 'CREATE_CUSTOMER',
      userId,
      customerId: savedCustomer.customerId,
      status: 'success',
      details: {
        ficoScore: request.ficoScore,
        creditLimit,
        verificationStatus: savedCustomer.verificationStatus,
      },
    });

    logger.info('Customer created successfully');

    // Return response
    return {
      customerId: savedCustomer.customerId,
      status: savedCustomer.status,
      createdAt: savedCustomer.createdAt.toISOString(),
      verificationStatus: savedCustomer.verificationStatus,
      creditLimit: savedCustomer.creditLimit,
    };
  }
}
