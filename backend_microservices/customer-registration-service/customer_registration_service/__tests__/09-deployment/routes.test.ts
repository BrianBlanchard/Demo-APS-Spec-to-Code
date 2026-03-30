import { Router } from 'express';
import { createCustomerRoutes } from '../../src/routes/customer.routes';
import { createHealthRoutes } from '../../src/routes/health.routes';
import { CustomerController } from '../../src/controllers/customer.controller';
import { HealthController } from '../../src/controllers/health.controller';

describe('Routes Configuration', () => {
  describe('createCustomerRoutes', () => {
    let mockController: jest.Mocked<CustomerController>;
    let router: Router;

    beforeEach(() => {
      mockController = {
        createCustomer: jest.fn(),
      } as any;

      router = createCustomerRoutes(mockController);
    });

    it('should return Express Router', () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe('function');
    });

    it('should configure POST /customers route', () => {
      const routes = (router as any).stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
        }));

      expect(routes).toContainEqual(
        expect.objectContaining({
          path: '/customers',
          methods: expect.arrayContaining(['post']),
        })
      );
    });
  });

  describe('createHealthRoutes', () => {
    let mockController: jest.Mocked<HealthController>;
    let router: Router;

    beforeEach(() => {
      mockController = {
        readiness: jest.fn(),
        liveness: jest.fn(),
      } as any;

      router = createHealthRoutes(mockController);
    });

    it('should return Express Router', () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe('function');
    });

    it('should configure GET /ready route', () => {
      const routes = (router as any).stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
        }));

      expect(routes).toContainEqual(
        expect.objectContaining({
          path: '/ready',
          methods: expect.arrayContaining(['get']),
        })
      );
    });

    it('should configure GET /live route', () => {
      const routes = (router as any).stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
        }));

      expect(routes).toContainEqual(
        expect.objectContaining({
          path: '/live',
          methods: expect.arrayContaining(['get']),
        })
      );
    });
  });
});
