import { Request, Response, NextFunction } from 'express';
import { InterestCalculationController } from '../../src/controllers/interestCalculationController';
import { IInterestCalculationService, CalculationResult } from '../../src/services/interestCalculationService';
import { NotFoundError, UnprocessableEntityError } from '../../src/models/errors';

// Test doubles
class MockInterestCalculationService implements IInterestCalculationService {
  private mockResult: CalculationResult | null = null;
  private mockError: Error | null = null;

  setMockResult(result: CalculationResult): void {
    this.mockResult = result;
    this.mockError = null;
  }

  setMockError(error: Error): void {
    this.mockError = error;
    this.mockResult = null;
  }

  async calculateInterest(
    _accountId: string,
    _calculationDate: Date,
    _applyToAccount: boolean,
    _calculatedBy: string,
  ): Promise<CalculationResult> {
    if (this.mockError) {
      throw this.mockError;
    }
    if (this.mockResult) {
      return this.mockResult;
    }
    throw new Error('Mock not configured');
  }
}

class MockResponse {
  private statusCode: number = 200;
  private body: unknown = null;

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  json(data: unknown): this {
    this.body = data;
    return this;
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  getBody(): unknown {
    return this.body;
  }
}

describe('InterestCalculationController', () => {
  let controller: InterestCalculationController;
  let mockService: MockInterestCalculationService;
  let mockResponse: MockResponse;
  let nextFunction: NextFunction;
  let capturedError: Error | null;

  beforeEach(() => {
    mockService = new MockInterestCalculationService();
    controller = new InterestCalculationController(mockService);
    mockResponse = new MockResponse();
    capturedError = null;
    nextFunction = (error?: unknown) => {
      if (error instanceof Error) {
        capturedError = error;
      }
    };
  });

  describe('calculateInterest', () => {
    describe('success scenarios', () => {
      it('should return 200 with calculation result when successful', async () => {
        const mockResult: CalculationResult = {
          accountId: 'ACC12345678',
          calculationDate: new Date('2026-03-15'),
          purchaseBalance: '2500.00',
          purchaseRate: '18.990',
          purchaseInterest: '39.56',
          purchaseInterestCalculation: '(2500.00 × 18.990) / 1200 = 39.5625 → 39.56 (HALF_UP)',
          cashAdvanceBalance: '500.00',
          cashAdvanceRate: '24.990',
          cashAdvanceInterest: '10.41',
          cashAdvanceInterestCalculation: '(500.00 × 24.990) / 1200 = 10.4125 → 10.41 (HALF_UP)',
          totalInterest: '49.97',
          minimumChargeApplied: false,
          appliedToAccount: false,
          calculatedAt: new Date('2026-03-27T10:00:00Z'),
          calculatedBy: 'user123',
        };

        mockService.setMockResult(mockResult);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        expect(mockResponse.getStatusCode()).toBe(200);
        const responseBody = mockResponse.getBody() as Record<string, unknown>;
        expect(responseBody.accountId).toBe('ACC12345678');
        expect(responseBody.calculationDate).toBe('2026-03-15');
        expect(responseBody.purchaseBalance).toBe('2500.00');
        expect(responseBody.purchaseRate).toBe('18.990');
        expect(responseBody.purchaseInterest).toBe('39.56');
        expect(responseBody.cashAdvanceBalance).toBe('500.00');
        expect(responseBody.cashAdvanceRate).toBe('24.990');
        expect(responseBody.cashAdvanceInterest).toBe('10.41');
        expect(responseBody.totalInterest).toBe('49.97');
        expect(responseBody.minimumChargeApplied).toBe(false);
        expect(responseBody.appliedToAccount).toBe(false);
        expect(responseBody.calculatedBy).toBe('user123');
        expect(capturedError).toBeNull();
      });

      it('should use system as calculatedBy when userId is not present', async () => {
        const mockResult: CalculationResult = {
          accountId: 'ACC12345678',
          calculationDate: new Date('2026-03-15'),
          purchaseBalance: '1000.00',
          purchaseRate: '18.990',
          purchaseInterest: '15.83',
          purchaseInterestCalculation: '(1000.00 × 18.990) / 1200 = 15.825 → 15.83 (HALF_UP)',
          cashAdvanceBalance: '0.00',
          cashAdvanceRate: '24.990',
          cashAdvanceInterest: '0.00',
          cashAdvanceInterestCalculation: '(0.00 × 24.990) / 1200 = 0.0000 → 0.00 (HALF_UP)',
          totalInterest: '15.83',
          minimumChargeApplied: false,
          appliedToAccount: false,
          calculatedAt: new Date('2026-03-27T10:00:00Z'),
          calculatedBy: 'system',
        };

        mockService.setMockResult(mockResult);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        expect(mockResponse.getStatusCode()).toBe(200);
        const responseBody = mockResponse.getBody() as Record<string, unknown>;
        expect(responseBody.calculatedBy).toBe('system');
      });

      it('should handle applyToAccount true', async () => {
        const mockResult: CalculationResult = {
          accountId: 'ACC12345678',
          calculationDate: new Date('2026-03-15'),
          purchaseBalance: '2500.00',
          purchaseRate: '18.990',
          purchaseInterest: '39.56',
          purchaseInterestCalculation: '(2500.00 × 18.990) / 1200 = 39.5625 → 39.56 (HALF_UP)',
          cashAdvanceBalance: '500.00',
          cashAdvanceRate: '24.990',
          cashAdvanceInterest: '10.41',
          cashAdvanceInterestCalculation: '(500.00 × 24.990) / 1200 = 10.4125 → 10.41 (HALF_UP)',
          totalInterest: '49.97',
          minimumChargeApplied: false,
          appliedToAccount: true,
          calculatedAt: new Date('2026-03-27T10:00:00Z'),
          calculatedBy: 'user123',
        };

        mockService.setMockResult(mockResult);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: true },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        expect(mockResponse.getStatusCode()).toBe(200);
        const responseBody = mockResponse.getBody() as Record<string, unknown>;
        expect(responseBody.appliedToAccount).toBe(true);
      });

      it('should format calculationDate to YYYY-MM-DD in response', async () => {
        const mockResult: CalculationResult = {
          accountId: 'ACC12345678',
          calculationDate: new Date('2026-03-15T00:00:00Z'),
          purchaseBalance: '1000.00',
          purchaseRate: '18.990',
          purchaseInterest: '15.83',
          purchaseInterestCalculation: '(1000.00 × 18.990) / 1200 = 15.825 → 15.83 (HALF_UP)',
          cashAdvanceBalance: '0.00',
          cashAdvanceRate: '24.990',
          cashAdvanceInterest: '0.00',
          cashAdvanceInterestCalculation: '(0.00 × 24.990) / 1200 = 0.0000 → 0.00 (HALF_UP)',
          totalInterest: '15.83',
          minimumChargeApplied: false,
          appliedToAccount: false,
          calculatedAt: new Date('2026-03-27T10:00:00Z'),
          calculatedBy: 'user123',
        };

        mockService.setMockResult(mockResult);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        const responseBody = mockResponse.getBody() as Record<string, unknown>;
        expect(responseBody.calculationDate).toBe('2026-03-15');
      });

      it('should format calculatedAt to ISO string in response', async () => {
        const calculatedAt = new Date('2026-03-27T10:30:00.000Z');
        const mockResult: CalculationResult = {
          accountId: 'ACC12345678',
          calculationDate: new Date('2026-03-15'),
          purchaseBalance: '1000.00',
          purchaseRate: '18.990',
          purchaseInterest: '15.83',
          purchaseInterestCalculation: '(1000.00 × 18.990) / 1200 = 15.825 → 15.83 (HALF_UP)',
          cashAdvanceBalance: '0.00',
          cashAdvanceRate: '24.990',
          cashAdvanceInterest: '0.00',
          cashAdvanceInterestCalculation: '(0.00 × 24.990) / 1200 = 0.0000 → 0.00 (HALF_UP)',
          totalInterest: '15.83',
          minimumChargeApplied: false,
          appliedToAccount: false,
          calculatedAt,
          calculatedBy: 'user123',
        };

        mockService.setMockResult(mockResult);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        const responseBody = mockResponse.getBody() as Record<string, unknown>;
        expect(responseBody.calculatedAt).toBe('2026-03-27T10:30:00.000Z');
      });

      it('should include calculation formulas in response', async () => {
        const mockResult: CalculationResult = {
          accountId: 'ACC12345678',
          calculationDate: new Date('2026-03-15'),
          purchaseBalance: '2500.00',
          purchaseRate: '18.990',
          purchaseInterest: '39.56',
          purchaseInterestCalculation: '(2500.00 × 18.990) / 1200 = 39.5625 → 39.56 (HALF_UP)',
          cashAdvanceBalance: '500.00',
          cashAdvanceRate: '24.990',
          cashAdvanceInterest: '10.41',
          cashAdvanceInterestCalculation: '(500.00 × 24.990) / 1200 = 10.4125 → 10.41 (HALF_UP)',
          totalInterest: '49.97',
          minimumChargeApplied: false,
          appliedToAccount: false,
          calculatedAt: new Date('2026-03-27T10:00:00Z'),
          calculatedBy: 'user123',
        };

        mockService.setMockResult(mockResult);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        const responseBody = mockResponse.getBody() as Record<string, unknown>;
        expect(responseBody.purchaseInterestCalculation).toBe(
          '(2500.00 × 18.990) / 1200 = 39.5625 → 39.56 (HALF_UP)',
        );
        expect(responseBody.cashAdvanceInterestCalculation).toBe(
          '(500.00 × 24.990) / 1200 = 10.4125 → 10.41 (HALF_UP)',
        );
      });

      it('should handle minimum charge applied scenario', async () => {
        const mockResult: CalculationResult = {
          accountId: 'ACC12345678',
          calculationDate: new Date('2026-03-15'),
          purchaseBalance: '10.00',
          purchaseRate: '18.990',
          purchaseInterest: '0.50',
          purchaseInterestCalculation: '(10.00 × 18.990) / 1200 = 0.1583 → 0.50 (HALF_UP)',
          cashAdvanceBalance: '0.00',
          cashAdvanceRate: '24.990',
          cashAdvanceInterest: '0.00',
          cashAdvanceInterestCalculation: '(0.00 × 24.990) / 1200 = 0.0000 → 0.00 (HALF_UP)',
          totalInterest: '0.50',
          minimumChargeApplied: true,
          appliedToAccount: false,
          calculatedAt: new Date('2026-03-27T10:00:00Z'),
          calculatedBy: 'user123',
        };

        mockService.setMockResult(mockResult);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        const responseBody = mockResponse.getBody() as Record<string, unknown>;
        expect(responseBody.minimumChargeApplied).toBe(true);
        expect(responseBody.totalInterest).toBe('0.50');
      });
    });

    describe('error handling', () => {
      it('should call next with NotFoundError when account not found', async () => {
        const error = new NotFoundError('Account does not exist', { accountId: 'ACC12345678' });
        mockService.setMockError(error);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        expect(capturedError).toBe(error);
        expect(capturedError).toBeInstanceOf(NotFoundError);
      });

      it('should call next with UnprocessableEntityError when account is closed', async () => {
        const error = new UnprocessableEntityError('Cannot calculate interest for closed account', {
          accountStatus: 'CLOSED',
        });
        mockService.setMockError(error);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        expect(capturedError).toBe(error);
        expect(capturedError).toBeInstanceOf(UnprocessableEntityError);
      });

      it('should call next with any error thrown by service', async () => {
        const error = new Error('Unexpected error');
        mockService.setMockError(error);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        expect(capturedError).toBe(error);
      });

      it('should not set response when error occurs', async () => {
        const error = new NotFoundError('Account does not exist');
        mockService.setMockError(error);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        expect(mockResponse.getBody()).toBeNull();
      });
    });

    describe('request parsing', () => {
      it('should extract accountId from params', async () => {
        const mockResult: CalculationResult = {
          accountId: 'ACC99999999',
          calculationDate: new Date('2026-03-15'),
          purchaseBalance: '1000.00',
          purchaseRate: '18.990',
          purchaseInterest: '15.83',
          purchaseInterestCalculation: '(1000.00 × 18.990) / 1200 = 15.825 → 15.83 (HALF_UP)',
          cashAdvanceBalance: '0.00',
          cashAdvanceRate: '24.990',
          cashAdvanceInterest: '0.00',
          cashAdvanceInterestCalculation: '(0.00 × 24.990) / 1200 = 0.0000 → 0.00 (HALF_UP)',
          totalInterest: '15.83',
          minimumChargeApplied: false,
          appliedToAccount: false,
          calculatedAt: new Date('2026-03-27T10:00:00Z'),
          calculatedBy: 'user123',
        };

        mockService.setMockResult(mockResult);

        const mockRequest = {
          params: { accountId: 'ACC99999999' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        const responseBody = mockResponse.getBody() as Record<string, unknown>;
        expect(responseBody.accountId).toBe('ACC99999999');
      });

      it('should parse calculationDate from body and convert to Date', async () => {
        const mockResult: CalculationResult = {
          accountId: 'ACC12345678',
          calculationDate: new Date('2026-02-28'),
          purchaseBalance: '1000.00',
          purchaseRate: '18.990',
          purchaseInterest: '15.83',
          purchaseInterestCalculation: '(1000.00 × 18.990) / 1200 = 15.825 → 15.83 (HALF_UP)',
          cashAdvanceBalance: '0.00',
          cashAdvanceRate: '24.990',
          cashAdvanceInterest: '0.00',
          cashAdvanceInterestCalculation: '(0.00 × 24.990) / 1200 = 0.0000 → 0.00 (HALF_UP)',
          totalInterest: '15.83',
          minimumChargeApplied: false,
          appliedToAccount: false,
          calculatedAt: new Date('2026-03-27T10:00:00Z'),
          calculatedBy: 'user123',
        };

        mockService.setMockResult(mockResult);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-02-28', applyToAccount: false },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        const responseBody = mockResponse.getBody() as Record<string, unknown>;
        expect(responseBody.calculationDate).toBe('2026-02-28');
      });

      it('should extract applyToAccount from body', async () => {
        const mockResult: CalculationResult = {
          accountId: 'ACC12345678',
          calculationDate: new Date('2026-03-15'),
          purchaseBalance: '1000.00',
          purchaseRate: '18.990',
          purchaseInterest: '15.83',
          purchaseInterestCalculation: '(1000.00 × 18.990) / 1200 = 15.825 → 15.83 (HALF_UP)',
          cashAdvanceBalance: '0.00',
          cashAdvanceRate: '24.990',
          cashAdvanceInterest: '0.00',
          cashAdvanceInterestCalculation: '(0.00 × 24.990) / 1200 = 0.0000 → 0.00 (HALF_UP)',
          totalInterest: '15.83',
          minimumChargeApplied: false,
          appliedToAccount: true,
          calculatedAt: new Date('2026-03-27T10:00:00Z'),
          calculatedBy: 'user123',
        };

        mockService.setMockResult(mockResult);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: true },
          userId: 'user123',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        const responseBody = mockResponse.getBody() as Record<string, unknown>;
        expect(responseBody.appliedToAccount).toBe(true);
      });

      it('should extract userId from request', async () => {
        const mockResult: CalculationResult = {
          accountId: 'ACC12345678',
          calculationDate: new Date('2026-03-15'),
          purchaseBalance: '1000.00',
          purchaseRate: '18.990',
          purchaseInterest: '15.83',
          purchaseInterestCalculation: '(1000.00 × 18.990) / 1200 = 15.825 → 15.83 (HALF_UP)',
          cashAdvanceBalance: '0.00',
          cashAdvanceRate: '24.990',
          cashAdvanceInterest: '0.00',
          cashAdvanceInterestCalculation: '(0.00 × 24.990) / 1200 = 0.0000 → 0.00 (HALF_UP)',
          totalInterest: '15.83',
          minimumChargeApplied: false,
          appliedToAccount: false,
          calculatedAt: new Date('2026-03-27T10:00:00Z'),
          calculatedBy: 'testuser',
        };

        mockService.setMockResult(mockResult);

        const mockRequest = {
          params: { accountId: 'ACC12345678' },
          body: { calculationDate: '2026-03-15', applyToAccount: false },
          userId: 'testuser',
        } as unknown as Request;

        await controller.calculateInterest(
          mockRequest,
          mockResponse as unknown as Response,
          nextFunction,
        );

        const responseBody = mockResponse.getBody() as Record<string, unknown>;
        expect(responseBody.calculatedBy).toBe('testuser');
      });
    });
  });
});
