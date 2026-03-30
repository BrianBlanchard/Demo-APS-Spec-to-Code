import { InterestRateClient, MockInterestRateClient } from '../../src/repositories/interestRateClient';
import { ServiceUnavailableError } from '../../src/models/errors';

// Mock global fetch
class MockFetchResponse {
  constructor(
    private body: unknown,
    private status: number,
  ) {}

  get ok(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  async json(): Promise<unknown> {
    return this.body;
  }
}

let fetchCalls: Array<{ url: string; options: RequestInit }> = [];
let fetchResponse: MockFetchResponse | null = null;
let fetchError: Error | null = null;

global.fetch = async (url: string | URL | Request, options?: RequestInit): Promise<Response> => {
  const urlString = typeof url === 'string' ? url : url.toString();
  fetchCalls.push({ url: urlString, options: options || {} });

  if (fetchError) {
    throw fetchError;
  }

  if (fetchResponse) {
    return fetchResponse as unknown as Response;
  }

  throw new Error('Fetch not configured');
};

describe('InterestRateClient', () => {
  let client: InterestRateClient;

  beforeEach(() => {
    client = new InterestRateClient('http://localhost:3001');
    fetchCalls = [];
    fetchResponse = null;
    fetchError = null;
  });

  describe('getRatesForDisclosureGroup', () => {
    describe('successful requests', () => {
      it('should return rates when service responds successfully', async () => {
        fetchResponse = new MockFetchResponse(
          {
            rates: [
              { rateType: 'PURCHASE', rate: '18.990' },
              { rateType: 'CASH_ADVANCE', rate: '24.990' },
            ],
          },
          200,
        );

        const result = await client.getRatesForDisclosureGroup(BigInt(100));

        expect(result).toHaveLength(2);
        expect(result[0].rateType).toBe('PURCHASE');
        expect(result[0].rate).toBe('18.990');
        expect(result[1].rateType).toBe('CASH_ADVANCE');
        expect(result[1].rate).toBe('24.990');
      });

      it('should call correct URL with disclosure group ID', async () => {
        fetchResponse = new MockFetchResponse(
          {
            rates: [
              { rateType: 'PURCHASE', rate: '18.990' },
              { rateType: 'CASH_ADVANCE', rate: '24.990' },
            ],
          },
          200,
        );

        await client.getRatesForDisclosureGroup(BigInt(100));

        expect(fetchCalls).toHaveLength(1);
        expect(fetchCalls[0].url).toBe('http://localhost:3001/api/v1/disclosure-groups/100/rates');
      });

      it('should use GET method', async () => {
        fetchResponse = new MockFetchResponse(
          {
            rates: [
              { rateType: 'PURCHASE', rate: '18.990' },
              { rateType: 'CASH_ADVANCE', rate: '24.990' },
            ],
          },
          200,
        );

        await client.getRatesForDisclosureGroup(BigInt(100));

        expect(fetchCalls[0].options.method).toBe('GET');
      });

      it('should set Content-Type header', async () => {
        fetchResponse = new MockFetchResponse(
          {
            rates: [
              { rateType: 'PURCHASE', rate: '18.990' },
              { rateType: 'CASH_ADVANCE', rate: '24.990' },
            ],
          },
          200,
        );

        await client.getRatesForDisclosureGroup(BigInt(100));

        const headers = fetchCalls[0].options.headers as Record<string, string>;
        expect(headers['Content-Type']).toBe('application/json');
      });

      it('should handle empty rates array', async () => {
        fetchResponse = new MockFetchResponse({ rates: [] }, 200);

        const result = await client.getRatesForDisclosureGroup(BigInt(100));

        expect(result).toHaveLength(0);
      });

      it('should handle different disclosure group IDs', async () => {
        fetchResponse = new MockFetchResponse(
          {
            rates: [
              { rateType: 'PURCHASE', rate: '15.990' },
              { rateType: 'CASH_ADVANCE', rate: '20.990' },
            ],
          },
          200,
        );

        await client.getRatesForDisclosureGroup(BigInt(999));

        expect(fetchCalls[0].url).toBe('http://localhost:3001/api/v1/disclosure-groups/999/rates');
      });

      it('should handle large disclosure group IDs', async () => {
        fetchResponse = new MockFetchResponse(
          {
            rates: [
              { rateType: 'PURCHASE', rate: '18.990' },
              { rateType: 'CASH_ADVANCE', rate: '24.990' },
            ],
          },
          200,
        );

        await client.getRatesForDisclosureGroup(BigInt('12345678901234567890'));

        expect(fetchCalls[0].url).toContain('12345678901234567890');
      });

      it('should use custom base URL', async () => {
        const customClient = new InterestRateClient('https://api.example.com');
        fetchResponse = new MockFetchResponse(
          {
            rates: [
              { rateType: 'PURCHASE', rate: '18.990' },
              { rateType: 'CASH_ADVANCE', rate: '24.990' },
            ],
          },
          200,
        );

        await customClient.getRatesForDisclosureGroup(BigInt(100));

        expect(fetchCalls[0].url).toBe('https://api.example.com/api/v1/disclosure-groups/100/rates');
      });

      it('should parse rate response correctly', async () => {
        fetchResponse = new MockFetchResponse(
          {
            rates: [
              { rateType: 'PURCHASE', rate: '12.500' },
              { rateType: 'CASH_ADVANCE', rate: '19.250' },
            ],
          },
          200,
        );

        const result = await client.getRatesForDisclosureGroup(BigInt(100));

        expect(result[0].rate).toBe('12.500');
        expect(result[1].rate).toBe('19.250');
      });
    });

    describe('error handling', () => {
      it('should throw ServiceUnavailableError when response is not ok', async () => {
        fetchResponse = new MockFetchResponse({ error: 'Not found' }, 404);

        await expect(client.getRatesForDisclosureGroup(BigInt(100))).rejects.toThrow(
          ServiceUnavailableError,
        );
      });

      it('should throw ServiceUnavailableError with 500 status', async () => {
        fetchResponse = new MockFetchResponse({ error: 'Internal error' }, 500);

        await expect(client.getRatesForDisclosureGroup(BigInt(100))).rejects.toThrow(
          ServiceUnavailableError,
        );
      });

      it('should throw ServiceUnavailableError with 503 status', async () => {
        fetchResponse = new MockFetchResponse({ error: 'Service unavailable' }, 503);

        await expect(client.getRatesForDisclosureGroup(BigInt(100))).rejects.toThrow(
          ServiceUnavailableError,
        );
      });

      it('should throw ServiceUnavailableError when fetch throws error', async () => {
        fetchError = new Error('Network error');

        await expect(client.getRatesForDisclosureGroup(BigInt(100))).rejects.toThrow(
          ServiceUnavailableError,
        );
      });

      it('should include disclosure group ID in error details', async () => {
        fetchResponse = new MockFetchResponse({ error: 'Not found' }, 404);

        try {
          await client.getRatesForDisclosureGroup(BigInt(100));
          fail('Should have thrown error');
        } catch (error) {
          if (error instanceof ServiceUnavailableError) {
            expect(error.details?.disclosureGroupId).toBe('100');
          }
        }
      });

      it('should include original error message in details', async () => {
        fetchError = new Error('Connection refused');

        try {
          await client.getRatesForDisclosureGroup(BigInt(100));
          fail('Should have thrown error');
        } catch (error) {
          if (error instanceof ServiceUnavailableError) {
            expect(error.details?.originalError).toBe('Connection refused');
          }
        }
      });

      it('should handle timeout errors', async () => {
        fetchError = new Error('Request timeout');

        await expect(client.getRatesForDisclosureGroup(BigInt(100))).rejects.toThrow(
          ServiceUnavailableError,
        );
      });

      it('should handle malformed JSON response', async () => {
        fetchResponse = new MockFetchResponse(null, 200);

        await expect(client.getRatesForDisclosureGroup(BigInt(100))).rejects.toThrow(
          ServiceUnavailableError,
        );
      });
    });
  });
});

describe('MockInterestRateClient', () => {
  let mockClient: MockInterestRateClient;

  beforeEach(() => {
    mockClient = new MockInterestRateClient();
  });

  describe('getRatesForDisclosureGroup', () => {
    it('should return mock rates', async () => {
      const result = await mockClient.getRatesForDisclosureGroup(BigInt(100));

      expect(result).toHaveLength(2);
      expect(result[0].rateType).toBe('PURCHASE');
      expect(result[0].rate).toBe('18.990');
      expect(result[1].rateType).toBe('CASH_ADVANCE');
      expect(result[1].rate).toBe('24.990');
    });

    it('should return same rates for any disclosure group ID', async () => {
      const result1 = await mockClient.getRatesForDisclosureGroup(BigInt(100));
      const result2 = await mockClient.getRatesForDisclosureGroup(BigInt(999));

      expect(result1).toEqual(result2);
    });

    it('should always return two rates', async () => {
      const result = await mockClient.getRatesForDisclosureGroup(BigInt(1));

      expect(result).toHaveLength(2);
    });

    it('should return PURCHASE rate type', async () => {
      const result = await mockClient.getRatesForDisclosureGroup(BigInt(100));

      const purchaseRate = result.find((r) => r.rateType === 'PURCHASE');
      expect(purchaseRate).toBeDefined();
      expect(purchaseRate!.rate).toBe('18.990');
    });

    it('should return CASH_ADVANCE rate type', async () => {
      const result = await mockClient.getRatesForDisclosureGroup(BigInt(100));

      const cashAdvanceRate = result.find((r) => r.rateType === 'CASH_ADVANCE');
      expect(cashAdvanceRate).toBeDefined();
      expect(cashAdvanceRate!.rate).toBe('24.990');
    });

    it('should never fail', async () => {
      await expect(mockClient.getRatesForDisclosureGroup(BigInt(100))).resolves.toBeDefined();
    });

    it('should be async', async () => {
      const promise = mockClient.getRatesForDisclosureGroup(BigInt(100));
      expect(promise).toBeInstanceOf(Promise);
      await promise;
    });

    it('should handle large disclosure group IDs', async () => {
      const result = await mockClient.getRatesForDisclosureGroup(
        BigInt('12345678901234567890'),
      );

      expect(result).toHaveLength(2);
    });

    it('should return consistent rates across multiple calls', async () => {
      const result1 = await mockClient.getRatesForDisclosureGroup(BigInt(100));
      const result2 = await mockClient.getRatesForDisclosureGroup(BigInt(100));
      const result3 = await mockClient.getRatesForDisclosureGroup(BigInt(100));

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });
});
