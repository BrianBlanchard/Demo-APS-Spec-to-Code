import { logger } from '../../logging/logger';
import { ExternalServiceError } from '../../errors/AppError';

export interface CreditBureauResponse {
  ficoScore: number;
  creditReportPulled: boolean;
  bureauResponse: string;
}

export interface GovernmentIdResponse {
  idValid: boolean;
  idActive: boolean;
  nameMatch: boolean;
  addressMatch: boolean;
}

export interface FraudDetectionResponse {
  riskScore: number;
  riskLevel: string;
  flaggedPatterns: string[];
}

export interface AddressVerificationResponse {
  addressValid: boolean;
  deliverable: boolean;
  residentialType: string;
}

export interface ExternalServiceClient {
  verifyCreditBureau(
    ssn: string,
    dateOfBirth: string,
    address: Record<string, unknown>
  ): Promise<CreditBureauResponse>;
  verifyGovernmentId(
    governmentId: string,
    governmentIdType: string,
    governmentIdState: string,
    name: string,
    address: Record<string, unknown>
  ): Promise<GovernmentIdResponse>;
  detectFraud(
    customerId: string,
    ssn: string,
    address: Record<string, unknown>
  ): Promise<FraudDetectionResponse>;
  verifyAddress(address: Record<string, unknown>): Promise<AddressVerificationResponse>;
}

export class ExternalServiceClientImpl implements ExternalServiceClient {
  async verifyCreditBureau(
    _ssn: string,
    _dateOfBirth: string,
    _address: Record<string, unknown>
  ): Promise<CreditBureauResponse> {
    try {
      logger.info({ service: 'credit_bureau' }, 'Calling credit bureau API');

      // Simulated API call - in production, replace with actual HTTP request
      await this.simulateApiCall();

      // Simulated response
      return {
        ficoScore: 720,
        creditReportPulled: true,
        bureauResponse: 'success',
      };
    } catch (error) {
      logger.error({ err: error, service: 'credit_bureau' }, 'Credit bureau API failed');
      throw new ExternalServiceError('Credit bureau service unavailable');
    }
  }

  async verifyGovernmentId(
    _governmentId: string,
    _governmentIdType: string,
    _governmentIdState: string,
    _name: string,
    _address: Record<string, unknown>
  ): Promise<GovernmentIdResponse> {
    try {
      logger.info({ service: 'government_id' }, 'Calling government ID verification API');

      await this.simulateApiCall();

      return {
        idValid: true,
        idActive: true,
        nameMatch: true,
        addressMatch: true,
      };
    } catch (error) {
      logger.error({ err: error, service: 'government_id' }, 'Government ID API failed');
      throw new ExternalServiceError('Government ID verification service unavailable');
    }
  }

  async detectFraud(
    _customerId: string,
    _ssn: string,
    _address: Record<string, unknown>
  ): Promise<FraudDetectionResponse> {
    try {
      logger.info({ service: 'fraud_detection' }, 'Calling fraud detection API');

      await this.simulateApiCall();

      return {
        riskScore: 15,
        riskLevel: 'low',
        flaggedPatterns: [],
      };
    } catch (error) {
      logger.error({ err: error, service: 'fraud_detection' }, 'Fraud detection API failed');
      throw new ExternalServiceError('Fraud detection service unavailable');
    }
  }

  async verifyAddress(_address: Record<string, unknown>): Promise<AddressVerificationResponse> {
    try {
      logger.info({ service: 'address_verification' }, 'Calling address verification API');

      await this.simulateApiCall();

      return {
        addressValid: true,
        deliverable: true,
        residentialType: 'single_family',
      };
    } catch (error) {
      logger.error(
        { err: error, service: 'address_verification' },
        'Address verification API failed'
      );
      throw new ExternalServiceError('Address verification service unavailable');
    }
  }

  private async simulateApiCall(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }
}
