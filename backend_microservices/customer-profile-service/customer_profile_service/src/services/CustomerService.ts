import { ICustomerRepository } from '../repositories/CustomerRepository';
import { ICacheService } from './CacheService';
import { IAuditService } from './AuditService';
import {
  CustomerDTO,
  UpdateCustomerRequestDTO,
  UpdateCustomerResponseDTO,
  UserContext,
} from '../types/dtos';
import { CustomerEntity } from '../types/entities';
import { mapCustomerEntityToDTO } from '../utils/mapper';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
} from '../exceptions/AppError';
import {
  validateCustomerId,
  validateStateZipCode,
  validatePhoneNumber,
} from '../utils/validation';
import { logger } from '../config/logger';

export interface ICustomerService {
  getCustomerById(
    customerId: string,
    userContext: UserContext,
    includeAccounts?: boolean
  ): Promise<CustomerDTO>;
  updateCustomer(
    customerId: string,
    updates: UpdateCustomerRequestDTO,
    userContext: UserContext
  ): Promise<UpdateCustomerResponseDTO>;
}

export class CustomerService implements ICustomerService {
  private readonly CACHE_PREFIX = 'customer:';

  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly cacheService: ICacheService,
    private readonly auditService: IAuditService
  ) {}

  async getCustomerById(
    customerId: string,
    userContext: UserContext,
    includeAccounts = false
  ): Promise<CustomerDTO> {
    validateCustomerId(customerId);
    this.validateCustomerAccess(customerId, userContext);

    const cacheKey = `${this.CACHE_PREFIX}${customerId}`;

    // Try cache first
    const cached = await this.cacheService.get<CustomerDTO>(cacheKey);
    if (cached) {
      logger.info({ customerId }, 'Customer retrieved from cache');
      return cached;
    }

    // Fetch from database
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError(`Customer ${customerId} not found`);
    }

    let accounts;
    if (includeAccounts) {
      accounts = await this.customerRepository.findAccountsByCustomerId(customerId);
    }

    const dto = mapCustomerEntityToDTO(customer, userContext.role, accounts);

    // Update cache
    await this.cacheService.set(cacheKey, dto);

    logger.info({ customerId, includeAccounts }, 'Customer retrieved from database');
    return dto;
  }

  async updateCustomer(
    customerId: string,
    updates: UpdateCustomerRequestDTO,
    userContext: UserContext
  ): Promise<UpdateCustomerResponseDTO> {
    validateCustomerId(customerId);
    this.validateCustomerAccess(customerId, userContext);
    this.validateUpdates(updates);

    // Fetch current customer
    const currentCustomer = await this.customerRepository.findById(customerId);
    if (!currentCustomer) {
      throw new NotFoundError(`Customer ${customerId} not found`);
    }

    // Build update object
    const entityUpdates: Partial<CustomerEntity> = {};
    const updatedFields: string[] = [];

    if (updates.addressLine1 !== undefined) {
      entityUpdates.address_line1 = updates.addressLine1;
      updatedFields.push('addressLine1');
    }
    if (updates.addressLine2 !== undefined) {
      entityUpdates.address_line2 = updates.addressLine2;
      updatedFields.push('addressLine2');
    }
    if (updates.city !== undefined) {
      entityUpdates.city = updates.city;
      updatedFields.push('city');
    }
    if (updates.state !== undefined) {
      entityUpdates.state = updates.state;
      updatedFields.push('state');
    }
    if (updates.zipCode !== undefined) {
      entityUpdates.zip_code = updates.zipCode;
      updatedFields.push('zipCode');
    }
    if (updates.phone1 !== undefined) {
      entityUpdates.phone1 = updates.phone1;
      updatedFields.push('phone1');
    }
    if (updates.phone2 !== undefined) {
      entityUpdates.phone2 = updates.phone2;
      updatedFields.push('phone2');
    }

    entityUpdates.updated_by = userContext.userId;

    // Optimistic locking
    let updatedCustomer: CustomerEntity;
    try {
      updatedCustomer = await this.customerRepository.update(
        customerId,
        entityUpdates,
        currentCustomer.version
      );
    } catch (error) {
      logger.error({ error, customerId }, 'Update failed - optimistic lock conflict');
      throw new ConflictError('Customer data was modified by another user');
    }

    // Log audit trail
    try {
      await this.auditService.logFieldChanges(
        customerId,
        currentCustomer,
        entityUpdates,
        userContext.userId,
        userContext.ipAddress,
        userContext.traceId
      );
    } catch (error) {
      logger.error({ error, customerId }, 'Audit logging failed');
      throw new InternalServerError('Failed to create audit log');
    }

    // Invalidate cache
    await this.cacheService.delete(`${this.CACHE_PREFIX}${customerId}`);

    logger.info({ customerId, updatedFields }, 'Customer updated successfully');

    return {
      customerId,
      updatedFields,
      updatedAt: updatedCustomer.updated_at.toISOString(),
      updatedBy: updatedCustomer.updated_by,
    };
  }

  private validateCustomerAccess(customerId: string, userContext: UserContext): void {
    if (userContext.role === 'CUSTOMER' && userContext.customerId !== customerId) {
      throw new ForbiddenError('Customers can only access their own data');
    }
  }

  private validateUpdates(updates: UpdateCustomerRequestDTO): void {
    // State/ZIP cross-validation
    if (updates.state && updates.zipCode) {
      validateStateZipCode(updates.state, updates.zipCode);
    }

    // Phone validation
    if (updates.phone1) {
      validatePhoneNumber(updates.phone1);
    }
    if (updates.phone2) {
      validatePhoneNumber(updates.phone2);
    }
  }
}
