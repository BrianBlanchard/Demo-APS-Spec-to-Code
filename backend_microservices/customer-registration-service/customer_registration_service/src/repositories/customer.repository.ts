import { Knex } from 'knex';
import { Customer, CustomerStatus, VerificationStatus } from '../types/customer.types';
import { logger } from '../config/logger.config';

export interface ICustomerRepository {
  create(customer: Omit<Customer, 'createdAt' | 'updatedAt'>): Promise<Customer>;
  findBySSN(ssn: string): Promise<Customer | null>;
  findByGovernmentId(governmentId: string): Promise<Customer | null>;
  findById(customerId: string): Promise<Customer | null>;
}

export class CustomerRepository implements ICustomerRepository {
  private readonly tableName = 'customers';

  constructor(private readonly db: Knex) {}

  async create(customer: Omit<Customer, 'createdAt' | 'updatedAt'>): Promise<Customer> {
    logger.info('Creating customer in database');

    const [result] = await this.db(this.tableName)
      .insert({
        customer_id: customer.customerId,
        first_name: customer.firstName,
        middle_name: customer.middleName,
        last_name: customer.lastName,
        date_of_birth: customer.dateOfBirth,
        ssn: customer.ssn,
        government_id: customer.governmentId,
        address_line1: customer.addressLine1,
        address_line2: customer.addressLine2,
        address_line3: customer.addressLine3,
        city: customer.city,
        state: customer.state,
        zip_code: customer.zipCode,
        country: customer.country,
        phone1: customer.phone1,
        phone2: customer.phone2,
        eft_account_id: customer.eftAccountId,
        is_primary_cardholder: customer.isPrimaryCardholder ? 'Y' : 'N',
        fico_score: customer.ficoScore,
        status: customer.status,
        verification_status: customer.verificationStatus,
        credit_limit: customer.creditLimit,
        created_by: customer.createdBy,
        updated_by: customer.updatedBy,
      })
      .returning('*');

    return this.mapToCustomer(result);
  }

  async findBySSN(ssn: string): Promise<Customer | null> {
    logger.info('Finding customer by SSN');

    const result = await this.db(this.tableName).where('ssn', ssn).first();

    return result ? this.mapToCustomer(result) : null;
  }

  async findByGovernmentId(governmentId: string): Promise<Customer | null> {
    logger.info('Finding customer by government ID');

    const result = await this.db(this.tableName).where('government_id', governmentId).first();

    return result ? this.mapToCustomer(result) : null;
  }

  async findById(customerId: string): Promise<Customer | null> {
    logger.info('Finding customer by ID');

    const result = await this.db(this.tableName).where('customer_id', customerId).first();

    return result ? this.mapToCustomer(result) : null;
  }

  private mapToCustomer(row: Record<string, unknown>): Customer {
    return {
      customerId: row.customer_id as string,
      firstName: row.first_name as string,
      middleName: row.middle_name as string | undefined,
      lastName: row.last_name as string,
      dateOfBirth: new Date(row.date_of_birth as string),
      ssn: row.ssn as string,
      governmentId: row.government_id as string,
      addressLine1: row.address_line1 as string,
      addressLine2: row.address_line2 as string | undefined,
      addressLine3: row.address_line3 as string | undefined,
      city: row.city as string,
      state: row.state as string,
      zipCode: row.zip_code as string,
      country: row.country as string,
      phone1: row.phone1 as string,
      phone2: row.phone2 as string | undefined,
      eftAccountId: row.eft_account_id as string | undefined,
      isPrimaryCardholder: row.is_primary_cardholder === 'Y',
      ficoScore: row.fico_score as number,
      status: row.status as CustomerStatus,
      verificationStatus: row.verification_status as VerificationStatus,
      creditLimit: parseFloat(row.credit_limit as string),
      createdAt: new Date(row.created_at as string),
      createdBy: row.created_by as string,
      updatedAt: new Date(row.updated_at as string),
      updatedBy: row.updated_by as string,
    };
  }
}
