import { v4 as uuidv4 } from 'uuid';
import { VerificationRepository } from '../repositories/VerificationRepository';
import { ExternalServiceClient } from './external/ExternalServiceClient';
import { AuditService } from '../audit/AuditService';
import {
  InitiateVerificationRequestDto,
  InitiateVerificationResponseDto,
  VerificationStatusResponseDto,
  CheckStatusDto,
} from '../types/dtos';
import {
  CheckType,
  VerificationStatus,
  CheckStatus,
  CheckResult,
  ApprovalStatus,
} from '../types/enums';
import {
  ValidationError,
  NotFoundError,
  VerificationFailedError,
  ExternalServiceError,
} from '../errors/AppError';
import { config } from '../config/config';
import { logger } from '../logging/logger';

export interface VerificationService {
  initiateVerification(
    request: InitiateVerificationRequestDto
  ): Promise<InitiateVerificationResponseDto>;
  getVerificationStatus(verificationId: string): Promise<VerificationStatusResponseDto>;
}

export class VerificationServiceImpl implements VerificationService {
  constructor(
    private readonly repository: VerificationRepository,
    private readonly externalClient: ExternalServiceClient,
    private readonly auditService: AuditService
  ) {}

  async initiateVerification(
    request: InitiateVerificationRequestDto
  ): Promise<InitiateVerificationResponseDto> {
    const customer = await this.repository.getCustomerById(request.customerId);
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${request.customerId} not found`);
    }

    await this.validateVerificationData(request);

    const verificationId = this.generateVerificationId();
    const verification = await this.repository.createVerification(
      verificationId,
      request.customerId,
      request.verificationType,
      request.priority
    );

    this.auditService.logVerificationInitiated(
      verificationId,
      request.customerId,
      request.verificationType
    );

    const checks = await this.initializeChecks(verificationId);

    this.processVerificationAsync(verificationId, request).catch((error) => {
      logger.error({ err: error, verificationId }, 'Async verification processing failed');
    });

    const estimatedCompletion = new Date(Date.now() + 5 * 60 * 1000);

    return {
      verificationId: verification.verificationId,
      customerId: verification.customerId,
      status: verification.status,
      initiatedAt: verification.initiatedAt.toISOString(),
      estimatedCompletion: estimatedCompletion.toISOString(),
      checks: checks.map((check) => ({
        checkType: check.checkType,
        status: check.status,
      })),
    };
  }

  async getVerificationStatus(verificationId: string): Promise<VerificationStatusResponseDto> {
    const verification = await this.repository.getVerificationById(verificationId);
    if (!verification) {
      throw new NotFoundError(`Verification with ID ${verificationId} not found`);
    }

    const checks = await this.repository.getChecksByVerificationId(verificationId);

    const checkStatuses: CheckStatusDto[] = checks.map((check) => ({
      checkType: check.checkType,
      status: check.status,
      result: check.result,
      details: check.details,
    }));

    return {
      verificationId: verification.verificationId,
      customerId: verification.customerId,
      status: verification.status,
      completedAt: verification.completedAt?.toISOString(),
      overallResult: verification.overallResult,
      checks: checkStatuses,
      manualReviewRequired: verification.manualReviewRequired,
      approvalStatus: verification.approvalStatus,
    };
  }

  private async validateVerificationData(request: InitiateVerificationRequestDto): Promise<void> {
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnRegex.test(request.verificationData.ssn)) {
      throw new ValidationError('Invalid SSN format. Expected format: xxx-xx-xxxx');
    }

    const dateOfBirth = new Date(request.verificationData.dateOfBirth);
    const age = this.calculateAge(dateOfBirth);
    if (age < 18) {
      throw new ValidationError('Customer must be at least 18 years old');
    }

    const existingCustomer = await this.repository.findCustomerBySsn(request.verificationData.ssn);
    if (existingCustomer && existingCustomer.customerId !== request.customerId) {
      this.auditService.logManualReviewRequired(
        'SSN_DUPLICATE',
        'SSN already exists for different customer'
      );
      throw new VerificationFailedError('SSN already exists for a different customer');
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    return age;
  }

  private generateVerificationId(): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomId = uuidv4().substring(0, 6).toUpperCase();
    return `VER-${date}-${randomId}`;
  }

  private async initializeChecks(verificationId: string) {
    const checkTypes = [
      CheckType.CREDIT_BUREAU,
      CheckType.GOVERNMENT_ID,
      CheckType.FRAUD_DETECTION,
      CheckType.ADDRESS_VERIFICATION,
    ];

    const checks = [];
    for (const checkType of checkTypes) {
      const check = await this.repository.createCheck(verificationId, checkType);
      checks.push(check);
    }

    return checks;
  }

  private async processVerificationAsync(
    verificationId: string,
    request: InitiateVerificationRequestDto
  ): Promise<void> {
    try {
      const checks = await this.repository.getChecksByVerificationId(verificationId);

      const results = await Promise.all([
        this.processCreditBureauCheck(
          checks.find((c) => c.checkType === CheckType.CREDIT_BUREAU)!.checkId,
          verificationId,
          request
        ),
        this.processGovernmentIdCheck(
          checks.find((c) => c.checkType === CheckType.GOVERNMENT_ID)!.checkId,
          verificationId,
          request
        ),
        this.processFraudDetectionCheck(
          checks.find((c) => c.checkType === CheckType.FRAUD_DETECTION)!.checkId,
          verificationId,
          request
        ),
        this.processAddressVerificationCheck(
          checks.find((c) => c.checkType === CheckType.ADDRESS_VERIFICATION)!.checkId,
          verificationId,
          request
        ),
      ]);

      await this.finalizeVerification(verificationId, request.customerId, results);
    } catch (error) {
      logger.error({ err: error, verificationId }, 'Verification processing failed');
      await this.repository.updateVerificationStatus(
        verificationId,
        VerificationStatus.FAILED,
        CheckResult.FAILED,
        new Date()
      );
    }
  }

  private async processCreditBureauCheck(
    checkId: string,
    verificationId: string,
    request: InitiateVerificationRequestDto
  ): Promise<{ result: string; ficoScore?: number }> {
    this.auditService.logCheckStarted(verificationId, CheckType.CREDIT_BUREAU);

    await this.repository.updateCheckStatus(checkId, CheckStatus.IN_PROGRESS);

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.externalClient.verifyCreditBureau(
          request.verificationData.ssn,
          request.verificationData.dateOfBirth,
          request.verificationData.address as unknown as Record<string, unknown>
        );
      }, verificationId, CheckType.CREDIT_BUREAU);

      const result =
        response.ficoScore >= config.fraudDetection.ficoScoreMinThreshold
          ? CheckResult.PASSED
          : CheckResult.REVIEW_REQUIRED;

      await this.repository.updateCheckStatus(
        checkId,
        CheckStatus.COMPLETED,
        result,
        response as unknown as Record<string, unknown>,
        new Date()
      );

      this.auditService.logCheckCompleted(verificationId, CheckType.CREDIT_BUREAU, result);

      return { result, ficoScore: response.ficoScore };
    } catch (error) {
      await this.handleCheckFailure(checkId, verificationId, CheckType.CREDIT_BUREAU, error);
      return { result: CheckResult.REVIEW_REQUIRED };
    }
  }

  private async processGovernmentIdCheck(
    checkId: string,
    verificationId: string,
    request: InitiateVerificationRequestDto
  ): Promise<{ result: string }> {
    this.auditService.logCheckStarted(verificationId, CheckType.GOVERNMENT_ID);

    await this.repository.updateCheckStatus(checkId, CheckStatus.IN_PROGRESS);

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.externalClient.verifyGovernmentId(
          request.verificationData.governmentId,
          request.verificationData.governmentIdType,
          request.verificationData.governmentIdState,
          request.customerId,
          request.verificationData.address as unknown as Record<string, unknown>
        );
      }, verificationId, CheckType.GOVERNMENT_ID);

      const result =
        response.idValid && response.idActive && response.nameMatch
          ? CheckResult.PASSED
          : CheckResult.FAILED;

      await this.repository.updateCheckStatus(
        checkId,
        CheckStatus.COMPLETED,
        result,
        response as unknown as Record<string, unknown>,
        new Date()
      );

      this.auditService.logCheckCompleted(verificationId, CheckType.GOVERNMENT_ID, result);

      return { result };
    } catch (error) {
      await this.handleCheckFailure(checkId, verificationId, CheckType.GOVERNMENT_ID, error);
      return { result: CheckResult.REVIEW_REQUIRED };
    }
  }

  private async processFraudDetectionCheck(
    checkId: string,
    verificationId: string,
    request: InitiateVerificationRequestDto
  ): Promise<{ result: string; riskScore?: number }> {
    this.auditService.logCheckStarted(verificationId, CheckType.FRAUD_DETECTION);

    await this.repository.updateCheckStatus(checkId, CheckStatus.IN_PROGRESS);

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.externalClient.detectFraud(
          request.customerId,
          request.verificationData.ssn,
          request.verificationData.address as unknown as Record<string, unknown>
        );
      }, verificationId, CheckType.FRAUD_DETECTION);

      const result =
        response.riskScore < config.fraudDetection.riskHighThreshold
          ? CheckResult.PASSED
          : CheckResult.FAILED;

      await this.repository.updateCheckStatus(
        checkId,
        CheckStatus.COMPLETED,
        result,
        response as unknown as Record<string, unknown>,
        new Date()
      );

      this.auditService.logCheckCompleted(verificationId, CheckType.FRAUD_DETECTION, result);

      return { result, riskScore: response.riskScore };
    } catch (error) {
      await this.handleCheckFailure(checkId, verificationId, CheckType.FRAUD_DETECTION, error);
      return { result: CheckResult.REVIEW_REQUIRED };
    }
  }

  private async processAddressVerificationCheck(
    checkId: string,
    verificationId: string,
    request: InitiateVerificationRequestDto
  ): Promise<{ result: string }> {
    this.auditService.logCheckStarted(verificationId, CheckType.ADDRESS_VERIFICATION);

    await this.repository.updateCheckStatus(checkId, CheckStatus.IN_PROGRESS);

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.externalClient.verifyAddress(request.verificationData.address as unknown as Record<string, unknown>);
      }, verificationId, CheckType.ADDRESS_VERIFICATION);

      const result = response.addressValid && response.deliverable
        ? CheckResult.PASSED
        : CheckResult.FAILED;

      await this.repository.updateCheckStatus(
        checkId,
        CheckStatus.COMPLETED,
        result,
        response as unknown as Record<string, unknown>,
        new Date()
      );

      this.auditService.logCheckCompleted(verificationId, CheckType.ADDRESS_VERIFICATION, result);

      return { result };
    } catch (error) {
      await this.handleCheckFailure(checkId, verificationId, CheckType.ADDRESS_VERIFICATION, error);
      return { result: CheckResult.REVIEW_REQUIRED };
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    verificationId: string,
    checkType: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.service.maxRetryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < config.service.maxRetryAttempts) {
          this.auditService.logRetryAttempt(verificationId, checkType, attempt);
          const delay = config.service.retryDelayMs * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new ExternalServiceError('Operation failed after retries');
  }

  private async handleCheckFailure(
    checkId: string,
    verificationId: string,
    checkType: string,
    error: unknown
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await this.repository.updateCheckStatus(
      checkId,
      CheckStatus.SERVICE_UNAVAILABLE,
      CheckResult.REVIEW_REQUIRED,
      {},
      new Date(),
      errorMessage
    );

    this.auditService.logCheckFailed(verificationId, checkType, errorMessage);
    this.auditService.logManualReviewRequired(verificationId, `${checkType} service unavailable`);
  }

  private async finalizeVerification(
    verificationId: string,
    customerId: string,
    results: Array<{ result: string; ficoScore?: number; riskScore?: number }>
  ): Promise<void> {
    const passedCount = results.filter((r) => r.result === CheckResult.PASSED).length;
    const failedCount = results.filter((r) => r.result === CheckResult.FAILED).length;

    let overallResult: string;
    let approvalStatus: string;
    let manualReviewRequired = false;

    if (failedCount > 0) {
      overallResult = CheckResult.FAILED;
      approvalStatus = ApprovalStatus.SUSPENDED;
      manualReviewRequired = true;
    } else if (passedCount === results.length) {
      overallResult = CheckResult.PASSED;
      approvalStatus = ApprovalStatus.AUTO_APPROVED;
    } else {
      overallResult = CheckResult.REVIEW_REQUIRED;
      approvalStatus = ApprovalStatus.PENDING_REVIEW;
      manualReviewRequired = true;
    }

    const ficoScore = results.find((r) => r.ficoScore)?.ficoScore;

    await this.repository.updateVerificationStatus(
      verificationId,
      VerificationStatus.COMPLETED,
      overallResult as any,
      new Date()
    );

    await this.repository.updateVerificationApprovalStatus(
      verificationId,
      approvalStatus as any,
      manualReviewRequired
    );

    await this.repository.updateCustomerVerificationStatus(
      customerId,
      overallResult,
      ficoScore
    );

    this.auditService.logVerificationCompleted(verificationId, customerId, overallResult);

    if (manualReviewRequired) {
      this.auditService.logManualReviewRequired(
        verificationId,
        'One or more checks did not pass'
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
