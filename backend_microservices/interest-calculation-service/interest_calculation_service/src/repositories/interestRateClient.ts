import { InterestRate } from '../models/entities';
import { ServiceUnavailableError } from '../models/errors';
import { logger } from '../config/logger';

export interface IInterestRateClient {
  getRatesForDisclosureGroup(disclosureGroupId: bigint): Promise<InterestRate[]>;
}

export class InterestRateClient implements IInterestRateClient {
  constructor(private readonly baseUrl: string) {}

  async getRatesForDisclosureGroup(disclosureGroupId: bigint): Promise<InterestRate[]> {
    try {
      // In a real implementation, this would call the external service
      // For now, we'll implement a mock that simulates the external service
      const response = await fetch(
        `${this.baseUrl}/api/v1/disclosure-groups/${disclosureGroupId}/rates`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Rate service returned status ${response.status}`);
      }

      const data = (await response.json()) as { rates: InterestRate[] };
      return data.rates;
    } catch (error) {
      logger.error({ error, disclosureGroupId }, 'Failed to retrieve interest rates');
      throw new ServiceUnavailableError('Interest rate service is unavailable', {
        disclosureGroupId: disclosureGroupId.toString(),
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

// Mock implementation for local development and testing
export class MockInterestRateClient implements IInterestRateClient {
  async getRatesForDisclosureGroup(_disclosureGroupId: bigint): Promise<InterestRate[]> {
    // Return mock rates for testing
    return [
      { rateType: 'PURCHASE', rate: '18.990' },
      { rateType: 'CASH_ADVANCE', rate: '24.990' },
    ];
  }
}
