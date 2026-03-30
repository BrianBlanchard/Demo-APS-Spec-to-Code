import request from 'supertest';
import { Application } from 'express';
import { Knex } from 'knex';
import { createApp } from '../../src/app';

// In-memory fake database for integration testing
class FakeIntegrationDatabase {
  private accounts: Map<string, Record<string, unknown>> = new Map();
  private balances: Map<string, Record<string, unknown>> = new Map();
  private calculations: Array<Record<string, unknown>> = [];

  constructor() {
    this.setupTestData();

    // Make the instance callable as a function
    const handler = {
      apply: (_target: unknown, _thisArg: unknown, args: unknown[]): unknown => {
        return this.call(args[0] as string);
      },
      get: (target: FakeIntegrationDatabase, prop: string | symbol): unknown => {
        return (target as unknown as Record<string | symbol, unknown>)[prop];
      },
    };
    return new Proxy(this, handler) as FakeIntegrationDatabase;
  }

  private setupTestData(): void {
    this.accounts.set('ACC12345678', {
      id: '1',
      account_id: 'ACC12345678',
      status: 'ACTIVE',
      disclosureGroupId: '100',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    this.balances.set('1', {
      id: '1',
      account_id: '1',
      currentBalance: '3000.00',
      purchaseBalance: '2500.00',
      cashAdvanceBalance: '500.00',
      lastInterestAmount: null,
      lastInterestDate: null,
      version: '1',
      updatedAt: new Date('2026-01-01'),
    });

    this.accounts.set('ACC99999999', {
      id: '2',
      account_id: 'ACC99999999',
      status: 'CLOSED',
      disclosureGroupId: '100',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    this.accounts.set('ACC11111111', {
      id: '3',
      account_id: 'ACC11111111',
      status: 'ACTIVE',
      disclosureGroupId: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });
  }

  call(tableName: string): unknown {
    const self = this;
    return {
      where(conditions: Record<string, unknown>): unknown {
        return {
          first(): Promise<unknown> {
            if (tableName === 'accounts') {
              const row = self.accounts.get(conditions.account_id as string);
              if (!row) return Promise.resolve(null);
              // Convert snake_case to camelCase
              return Promise.resolve(self.toCamelCase(row));
            }
            if (tableName === 'account_balances') {
              const row = self.balances.get(conditions.account_id as string);
              if (!row) return Promise.resolve(null);
              // Convert snake_case to camelCase
              return Promise.resolve(self.toCamelCase(row));
            }
            return Promise.resolve(null);
          },
          update(data: Record<string, unknown>): Promise<number> {
            if (tableName === 'account_balances') {
              const balance = self.balances.get(conditions.account_id as string);
              if (balance && String(balance.version) === String(conditions.version)) {
                // Handle fn.now() calls
                const updateData = { ...data };
                if (updateData.updated_at && typeof updateData.updated_at === 'object') {
                  updateData.updated_at = new Date();
                }
                Object.assign(balance, updateData);
                return Promise.resolve(1);
              }
            }
            return Promise.resolve(0);
          },
        };
      },
      async insert(data: Record<string, unknown>) {
        if (tableName === 'interest_calculations') {
          self.calculations.push(data);
        }
      },
    };
  }

  private toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase());
      result[camelKey] = value;
    }
    return result;
  }

  fn = {
    now: (): Date => new Date(),
  };

  raw(_query: string): Promise<unknown> {
    return Promise.resolve({ rows: [{ result: 1 }] });
  }

  getBalance(accountId: string): Record<string, unknown> | undefined {
    return this.balances.get(accountId);
  }

  getCalculations(): Array<Record<string, unknown>> {
    return this.calculations;
  }
}

describe('Interest Calculation Integration Tests', () => {
  let app: Application;
  let fakeDb: FakeIntegrationDatabase;

  beforeEach(() => {
    fakeDb = new FakeIntegrationDatabase();
    app = createApp(fakeDb as unknown as Knex);
  });

  describe('POST /api/v1/accounts/:accountId/interest', () => {
    describe('successful calculations', () => {
      it('should calculate interest and return 200', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          })
          .expect(200);

        expect(response.body.accountId).toBe('ACC12345678');
        expect(response.body.totalInterest).toBe('49.97');
      });

      it('should return all calculation details', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          });

        expect(response.body.purchaseBalance).toBe('2500.00');
        expect(response.body.purchaseRate).toBe('18.990');
        expect(response.body.purchaseInterest).toBe('39.56');
        expect(response.body.cashAdvanceBalance).toBe('500.00');
        expect(response.body.cashAdvanceRate).toBe('24.990');
        expect(response.body.cashAdvanceInterest).toBe('10.41');
        expect(response.body.totalInterest).toBe('49.97');
      });

      it('should include calculation formulas', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          });

        expect(response.body.purchaseInterestCalculation).toContain('2500.00');
        expect(response.body.purchaseInterestCalculation).toContain('18.990');
        expect(response.body.cashAdvanceInterestCalculation).toContain('500.00');
        expect(response.body.cashAdvanceInterestCalculation).toContain('24.990');
      });

      it('should set appliedToAccount to false when not applying', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          });

        expect(response.body.appliedToAccount).toBe(false);
      });

      it('should set appliedToAccount to true when applying', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: true,
          });

        expect(response.body.appliedToAccount).toBe(true);
      });

      it('should include timestamp fields', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          });

        expect(response.body.calculationDate).toBe('2026-03-15');
        expect(response.body.calculatedAt).toBeDefined();
        expect(response.body.calculatedBy).toBe('system');
      });

      it('should update account balance when applyToAccount is true', async () => {
        await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: true,
          });

        const balance = fakeDb.getBalance('1');
        expect(balance!.currentBalance).toBe('3049.97');
        expect(balance!.lastInterestAmount).toBe('49.97');
      });

      it('should not update account balance when applyToAccount is false', async () => {
        await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          });

        const balance = fakeDb.getBalance('1');
        expect(balance!.currentBalance).toBe('3000.00');
        expect(balance!.lastInterestAmount).toBeNull();
      });

      it('should save calculation to database', async () => {
        await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          });

        const calculations = fakeDb.getCalculations();
        expect(calculations.length).toBe(1);
        expect(calculations[0].account_id).toBe('1');
        expect(calculations[0].total_interest).toBe('49.97');
      });

      it('should set Content-Type to application/json', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          });

        expect(response.headers['content-type']).toMatch(/application\/json/);
      });
    });

    describe('validation errors', () => {
      it('should return 400 for missing calculationDate', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            applyToAccount: false,
          })
          .expect(400);

        expect(response.body.error).toBe('VALIDATION_ERROR');
      });

      it('should return 400 for missing applyToAccount', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
          })
          .expect(400);

        expect(response.body.error).toBe('VALIDATION_ERROR');
      });

      it('should return 400 for future date', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);

        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: futureDate.toISOString().split('T')[0],
            applyToAccount: false,
          })
          .expect(400);

        expect(response.body.error).toBe('VALIDATION_ERROR');
      });

      it('should return 400 for invalid date format', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: 'invalid-date',
            applyToAccount: false,
          })
          .expect(400);

        expect(response.body.error).toBe('VALIDATION_ERROR');
      });

      it('should return 400 for non-boolean applyToAccount', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC12345678/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: 'yes',
          })
          .expect(400);

        expect(response.body.error).toBe('VALIDATION_ERROR');
      });
    });

    describe('business logic errors', () => {
      it('should return 404 when account not found', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC88888888/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          })
          .expect(404);

        expect(response.body.error).toBe('NOT_FOUND');
        expect(response.body.message).toContain('Account does not exist');
      });

      it('should return 422 when account is closed', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC99999999/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          })
          .expect(422);

        expect(response.body.error).toBe('UNPROCESSABLE_ENTITY');
        expect(response.body.message).toContain('Cannot calculate interest for closed account');
      });

      it('should return 422 when account has no disclosure group', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC11111111/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          })
          .expect(422);

        expect(response.body.error).toBe('UNPROCESSABLE_ENTITY');
        expect(response.body.message).toContain('no disclosure group');
      });
    });

    describe('response format', () => {
      it('should include status code in error response', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC88888888/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          });

        expect(response.body.status).toBe(404);
      });

      it('should include timestamp in error response', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC88888888/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          });

        expect(response.body.timestamp).toBeDefined();
        expect(typeof response.body.timestamp).toBe('string');
      });

      it('should include traceId in error response', async () => {
        const response = await request(app)
          .post('/api/v1/accounts/ACC88888888/interest/calculate')
          .send({
            calculationDate: '2026-03-15',
            applyToAccount: false,
          });

        expect(response.body.traceId).toBeDefined();
      });
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 when database is available', async () => {
      const response = await request(app).get('/health/ready').expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('interest-calculation-service');
      expect(response.body.checks.database).toBe('up');
    });

    it('should include version', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.body.version).toBe('1.0.0');
    });

    it('should include timestamp', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.body.timestamp).toBeDefined();
      expect(typeof response.body.timestamp).toBe('string');
    });
  });

  describe('GET /health/live', () => {
    it('should return 200', async () => {
      const response = await request(app).get('/health/live').expect(200);

      expect(response.body.status).toBe('healthy');
    });

    it('should include service name', async () => {
      const response = await request(app).get('/health/live');

      expect(response.body.service).toBe('interest-calculation-service');
    });

    it('should not include database checks', async () => {
      const response = await request(app).get('/health/live');

      expect(response.body.checks).toBeUndefined();
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .post('/api/v1/accounts/ACC12345678/interest/calculate')
        .send({
          calculationDate: '2026-03-15',
          applyToAccount: false,
        });

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('end-to-end workflow', () => {
    it('should handle multiple calculations for same account', async () => {
      const response1 = await request(app)
        .post('/api/v1/accounts/ACC12345678/interest/calculate')
        .send({
          calculationDate: '2026-03-15',
          applyToAccount: false,
        });

      const response2 = await request(app)
        .post('/api/v1/accounts/ACC12345678/interest/calculate')
        .send({
          calculationDate: '2026-03-16',
          applyToAccount: false,
        });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(fakeDb.getCalculations().length).toBe(2);
    });

    it('should apply interest and verify balance update', async () => {
      const initialBalance = fakeDb.getBalance('1');
      expect(initialBalance!.currentBalance).toBe('3000.00');

      await request(app)
        .post('/api/v1/accounts/ACC12345678/interest/calculate')
        .send({
          calculationDate: '2026-03-15',
          applyToAccount: true,
        });

      const updatedBalance = fakeDb.getBalance('1');
      expect(updatedBalance!.currentBalance).toBe('3049.97');
      expect(updatedBalance!.lastInterestAmount).toBe('49.97');
      expect(updatedBalance!.version).toBe('2');
    });

    it('should handle calculation without applying then with applying', async () => {
      await request(app)
        .post('/api/v1/accounts/ACC12345678/interest/calculate')
        .send({
          calculationDate: '2026-03-15',
          applyToAccount: false,
        })
        .expect(200);

      const balance1 = fakeDb.getBalance('1');
      expect(balance1!.currentBalance).toBe('3000.00');

      await request(app)
        .post('/api/v1/accounts/ACC12345678/interest/calculate')
        .send({
          calculationDate: '2026-03-16',
          applyToAccount: true,
        })
        .expect(200);

      const balance2 = fakeDb.getBalance('1');
      expect(balance2!.currentBalance).toBe('3049.97');
    });
  });
});
