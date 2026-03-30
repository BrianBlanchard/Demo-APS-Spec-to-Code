import { Request, Response } from 'express';
import { HealthController } from '../../src/controllers/healthController';
import { Knex } from 'knex';

// Test doubles
class MockDatabase {
  private shouldSucceed = true;
  private rawQuery: string | null = null;

  setShouldSucceed(succeed: boolean): void {
    this.shouldSucceed = succeed;
  }

  getRawQuery(): string | null {
    return this.rawQuery;
  }

  raw(query: string): Promise<unknown> {
    this.rawQuery = query;
    if (this.shouldSucceed) {
      return Promise.resolve([{ '?column?': 1 }]);
    }
    return Promise.reject(new Error('Database connection failed'));
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

describe('HealthController', () => {
  let controller: HealthController;
  let mockDb: MockDatabase;
  let mockResponse: MockResponse;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    mockDb = new MockDatabase();
    controller = new HealthController(mockDb as unknown as Knex);
    mockResponse = new MockResponse();
    mockRequest = {};
  });

  describe('ready', () => {
    describe('when database is available', () => {
      it('should return 200 status', async () => {
        mockDb.setShouldSucceed(true);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        expect(mockResponse.getStatusCode()).toBe(200);
      });

      it('should return healthy status', async () => {
        mockDb.setShouldSucceed(true);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        const body = mockResponse.getBody() as Record<string, unknown>;
        expect(body.status).toBe('healthy');
      });

      it('should include timestamp in response', async () => {
        mockDb.setShouldSucceed(true);

        const beforeTime = new Date().toISOString();
        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );
        const afterTime = new Date().toISOString();

        const body = mockResponse.getBody() as Record<string, unknown>;
        expect(body.timestamp).toBeDefined();
        expect(typeof body.timestamp).toBe('string');
        expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        expect(body.timestamp! >= beforeTime).toBe(true);
        expect(body.timestamp! <= afterTime).toBe(true);
      });

      it('should include service name in response', async () => {
        mockDb.setShouldSucceed(true);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        const body = mockResponse.getBody() as Record<string, unknown>;
        expect(body.service).toBe('interest-calculation-service');
      });

      it('should include version in response', async () => {
        mockDb.setShouldSucceed(true);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        const body = mockResponse.getBody() as Record<string, unknown>;
        expect(body.version).toBe('1.0.0');
      });

      it('should include database up in checks', async () => {
        mockDb.setShouldSucceed(true);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        const body = mockResponse.getBody() as Record<string, unknown>;
        expect(body.checks).toBeDefined();
        const checks = body.checks as Record<string, string>;
        expect(checks.database).toBe('up');
      });

      it('should execute SELECT 1 query', async () => {
        mockDb.setShouldSucceed(true);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        expect(mockDb.getRawQuery()).toBe('SELECT 1');
      });
    });

    describe('when database is unavailable', () => {
      it('should return 503 status', async () => {
        mockDb.setShouldSucceed(false);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        expect(mockResponse.getStatusCode()).toBe(503);
      });

      it('should return unhealthy status', async () => {
        mockDb.setShouldSucceed(false);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        const body = mockResponse.getBody() as Record<string, unknown>;
        expect(body.status).toBe('unhealthy');
      });

      it('should include timestamp in response', async () => {
        mockDb.setShouldSucceed(false);

        const beforeTime = new Date().toISOString();
        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );
        const afterTime = new Date().toISOString();

        const body = mockResponse.getBody() as Record<string, unknown>;
        expect(body.timestamp).toBeDefined();
        expect(typeof body.timestamp).toBe('string');
        expect(body.timestamp! >= beforeTime).toBe(true);
        expect(body.timestamp! <= afterTime).toBe(true);
      });

      it('should include service name in response', async () => {
        mockDb.setShouldSucceed(false);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        const body = mockResponse.getBody() as Record<string, unknown>;
        expect(body.service).toBe('interest-calculation-service');
      });

      it('should include version in response', async () => {
        mockDb.setShouldSucceed(false);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        const body = mockResponse.getBody() as Record<string, unknown>;
        expect(body.version).toBe('1.0.0');
      });

      it('should include database down in checks', async () => {
        mockDb.setShouldSucceed(false);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        const body = mockResponse.getBody() as Record<string, unknown>;
        expect(body.checks).toBeDefined();
        const checks = body.checks as Record<string, string>;
        expect(checks.database).toBe('down');
      });

      it('should attempt to execute SELECT 1 query', async () => {
        mockDb.setShouldSucceed(false);

        await controller.ready(
          mockRequest as Request,
          mockResponse as unknown as Response,
        );

        expect(mockDb.getRawQuery()).toBe('SELECT 1');
      });

      it('should handle database errors gracefully', async () => {
        mockDb.setShouldSucceed(false);

        await expect(
          controller.ready(
            mockRequest as Request,
            mockResponse as unknown as Response,
          ),
        ).resolves.not.toThrow();
      });
    });
  });

  describe('live', () => {
    it('should return 200 status', () => {
      controller.live(
        mockRequest as Request,
        mockResponse as unknown as Response,
      );

      expect(mockResponse.getStatusCode()).toBe(200);
    });

    it('should return healthy status', () => {
      controller.live(
        mockRequest as Request,
        mockResponse as unknown as Response,
      );

      const body = mockResponse.getBody() as Record<string, unknown>;
      expect(body.status).toBe('healthy');
    });

    it('should include timestamp in response', () => {
      const beforeTime = new Date().toISOString();
      controller.live(
        mockRequest as Request,
        mockResponse as unknown as Response,
      );
      const afterTime = new Date().toISOString();

      const body = mockResponse.getBody() as Record<string, unknown>;
      expect(body.timestamp).toBeDefined();
      expect(typeof body.timestamp).toBe('string');
      expect(body.timestamp! >= beforeTime).toBe(true);
      expect(body.timestamp! <= afterTime).toBe(true);
    });

    it('should include service name in response', () => {
      controller.live(
        mockRequest as Request,
        mockResponse as unknown as Response,
      );

      const body = mockResponse.getBody() as Record<string, unknown>;
      expect(body.service).toBe('interest-calculation-service');
    });

    it('should include version in response', () => {
      controller.live(
        mockRequest as Request,
        mockResponse as unknown as Response,
      );

      const body = mockResponse.getBody() as Record<string, unknown>;
      expect(body.version).toBe('1.0.0');
    });

    it('should not include checks in response', () => {
      controller.live(
        mockRequest as Request,
        mockResponse as unknown as Response,
      );

      const body = mockResponse.getBody() as Record<string, unknown>;
      expect(body.checks).toBeUndefined();
    });

    it('should not access database', () => {
      controller.live(
        mockRequest as Request,
        mockResponse as unknown as Response,
      );

      expect(mockDb.getRawQuery()).toBeNull();
    });

    it('should be synchronous', () => {
      const result = controller.live(
        mockRequest as Request,
        mockResponse as unknown as Response,
      );

      expect(result).toBeUndefined();
    });

    it('should never fail', () => {
      mockDb.setShouldSucceed(false);

      expect(() =>
        controller.live(
          mockRequest as Request,
          mockResponse as unknown as Response,
        ),
      ).not.toThrow();
    });
  });
});
