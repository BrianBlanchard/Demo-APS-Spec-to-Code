import { createHealthRoutes } from '../health.routes';
import { HealthController } from '../../controllers/health.controller';

describe('HealthRoutes - Controller/API Layer', () => {
  let mockController: jest.Mocked<HealthController>;

  beforeEach(() => {
    mockController = {
      readiness: jest.fn(),
      liveness: jest.fn(),
      health: jest.fn(),
    } as any;
  });

  it('should create router with health endpoints', () => {
    const router = createHealthRoutes(mockController);

    expect(router).toBeDefined();
    expect(router).toBeInstanceOf(Function);
  });

  it('should register GET /ready route', () => {
    const router = createHealthRoutes(mockController);

    const routes = (router as any).stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

    expect(routes).toContainEqual({
      path: '/ready',
      methods: ['get'],
    });
  });

  it('should register GET /live route', () => {
    const router = createHealthRoutes(mockController);

    const routes = (router as any).stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

    expect(routes).toContainEqual({
      path: '/live',
      methods: ['get'],
    });
  });
});
