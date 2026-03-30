import { Knex } from 'knex';
import { VerificationRecord, VerificationCheck, Customer } from '../types/entities';
import {
  VerificationTypeValue,
  VerificationStatusValue,
  PriorityValue,
  ApprovalStatusValue,
  CheckTypeValue,
  CheckStatusValue,
  CheckResultValue,
} from '../types/enums';

export interface VerificationRepository {
  createVerification(
    verificationId: string,
    customerId: string,
    verificationType: VerificationTypeValue,
    priority: PriorityValue
  ): Promise<VerificationRecord>;
  getVerificationById(verificationId: string): Promise<VerificationRecord | null>;
  updateVerificationStatus(
    verificationId: string,
    status: VerificationStatusValue,
    overallResult?: CheckResultValue,
    completedAt?: Date
  ): Promise<void>;
  updateVerificationApprovalStatus(
    verificationId: string,
    approvalStatus: ApprovalStatusValue,
    manualReviewRequired: boolean
  ): Promise<void>;
  createCheck(
    verificationId: string,
    checkType: CheckTypeValue
  ): Promise<VerificationCheck>;
  getChecksByVerificationId(verificationId: string): Promise<VerificationCheck[]>;
  updateCheckStatus(
    checkId: string,
    status: CheckStatusValue,
    result?: CheckResultValue,
    details?: Record<string, unknown>,
    completedAt?: Date,
    errorMessage?: string
  ): Promise<void>;
  getCustomerById(customerId: string): Promise<Customer | null>;
  updateCustomerVerificationStatus(
    customerId: string,
    verificationStatus: string,
    ficoScore?: number
  ): Promise<void>;
  findCustomerBySsn(ssn: string): Promise<Customer | null>;
}

export class VerificationRepositoryImpl implements VerificationRepository {
  constructor(private readonly db: Knex) {}

  async createVerification(
    verificationId: string,
    customerId: string,
    verificationType: VerificationTypeValue,
    priority: PriorityValue
  ): Promise<VerificationRecord> {
    const now = new Date();
    const [record] = await this.db('verification_records')
      .insert({
        verification_id: verificationId,
        customer_id: customerId,
        verification_type: verificationType,
        status: 'in_progress',
        initiated_at: now,
        priority,
        manual_review_required: false,
        approval_status: 'pending_review',
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    return this.mapToVerificationRecord(record);
  }

  async getVerificationById(verificationId: string): Promise<VerificationRecord | null> {
    const record = await this.db('verification_records')
      .where('verification_id', verificationId)
      .first();

    return record ? this.mapToVerificationRecord(record) : null;
  }

  async updateVerificationStatus(
    verificationId: string,
    status: VerificationStatusValue,
    overallResult?: CheckResultValue,
    completedAt?: Date
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date(),
    };

    if (overallResult) {
      updateData.overall_result = overallResult;
    }

    if (completedAt) {
      updateData.completed_at = completedAt;
    }

    await this.db('verification_records')
      .where('verification_id', verificationId)
      .update(updateData);
  }

  async updateVerificationApprovalStatus(
    verificationId: string,
    approvalStatus: ApprovalStatusValue,
    manualReviewRequired: boolean
  ): Promise<void> {
    await this.db('verification_records')
      .where('verification_id', verificationId)
      .update({
        approval_status: approvalStatus,
        manual_review_required: manualReviewRequired,
        updated_at: new Date(),
      });
  }

  async createCheck(
    verificationId: string,
    checkType: CheckTypeValue
  ): Promise<VerificationCheck> {
    const now = new Date();
    const [record] = await this.db('verification_checks')
      .insert({
        verification_id: verificationId,
        check_type: checkType,
        status: 'pending',
        details: {},
        started_at: now,
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    return this.mapToVerificationCheck(record);
  }

  async getChecksByVerificationId(verificationId: string): Promise<VerificationCheck[]> {
    const records = await this.db('verification_checks')
      .where('verification_id', verificationId)
      .orderBy('created_at', 'asc');

    return records.map((record) => this.mapToVerificationCheck(record));
  }

  async updateCheckStatus(
    checkId: string,
    status: CheckStatusValue,
    result?: CheckResultValue,
    details?: Record<string, unknown>,
    completedAt?: Date,
    errorMessage?: string
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date(),
    };

    if (result) {
      updateData.result = result;
    }

    if (details) {
      updateData.details = JSON.stringify(details);
    }

    if (completedAt) {
      updateData.completed_at = completedAt;
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    await this.db('verification_checks').where('check_id', checkId).update(updateData);
  }

  async getCustomerById(customerId: string): Promise<Customer | null> {
    const record = await this.db('customers').where('customer_id', customerId).first();

    return record ? this.mapToCustomer(record) : null;
  }

  async updateCustomerVerificationStatus(
    customerId: string,
    verificationStatus: string,
    ficoScore?: number
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      verification_status: verificationStatus,
      updated_at: new Date(),
    };

    if (ficoScore !== undefined) {
      updateData.fico_score = ficoScore;
    }

    await this.db('customers').where('customer_id', customerId).update(updateData);
  }

  async findCustomerBySsn(ssn: string): Promise<Customer | null> {
    const record = await this.db('customers').where('ssn', ssn).first();

    return record ? this.mapToCustomer(record) : null;
  }

  private mapToVerificationRecord(record: unknown): VerificationRecord {
    const r = record as Record<string, unknown>;
    return {
      verificationId: r.verification_id as string,
      customerId: r.customer_id as string,
      verificationType: r.verification_type as VerificationTypeValue,
      status: r.status as VerificationStatusValue,
      overallResult: r.overall_result as CheckResultValue | undefined,
      initiatedAt: new Date(r.initiated_at as string),
      completedAt: r.completed_at ? new Date(r.completed_at as string) : undefined,
      priority: r.priority as PriorityValue,
      manualReviewRequired: r.manual_review_required as boolean,
      approvalStatus: r.approval_status as ApprovalStatusValue,
      createdAt: new Date(r.created_at as string),
      updatedAt: new Date(r.updated_at as string),
    };
  }

  private mapToVerificationCheck(record: unknown): VerificationCheck {
    const r = record as Record<string, unknown>;
    return {
      checkId: r.check_id as string,
      verificationId: r.verification_id as string,
      checkType: r.check_type as CheckTypeValue,
      status: r.status as CheckStatusValue,
      result: r.result as CheckResultValue | undefined,
      details:
        typeof r.details === 'string' ? JSON.parse(r.details) : (r.details as Record<string, unknown>),
      startedAt: new Date(r.started_at as string),
      completedAt: r.completed_at ? new Date(r.completed_at as string) : undefined,
      errorMessage: r.error_message as string | undefined,
      createdAt: new Date(r.created_at as string),
      updatedAt: new Date(r.updated_at as string),
    };
  }

  private mapToCustomer(record: unknown): Customer {
    const r = record as Record<string, unknown>;
    return {
      customerId: r.customer_id as string,
      ssn: r.ssn as string | undefined,
      dateOfBirth: r.date_of_birth ? new Date(r.date_of_birth as string) : undefined,
      governmentId: r.government_id as string | undefined,
      governmentIdType: r.government_id_type as string | undefined,
      governmentIdState: r.government_id_state as string | undefined,
      address:
        typeof r.address === 'string'
          ? JSON.parse(r.address)
          : (r.address as Record<string, unknown> | undefined),
      ficoScore: r.fico_score as number | undefined,
      verificationStatus: r.verification_status as string | undefined,
      createdAt: new Date(r.created_at as string),
      updatedAt: new Date(r.updated_at as string),
    };
  }
}
