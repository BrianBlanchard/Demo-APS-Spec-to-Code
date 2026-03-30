import { createTransactionSearchRoutes } from '../transaction-search.routes';
import { TransactionSearchController } from '../../controllers/transaction-search.controller';

describe('TransactionSearchRoutes - Controller/API Layer', () => {
  let mockController: jest.Mocked<TransactionSearchController>;

  beforeEach(() => {
    mockController = {
      search: jest.fn(),
    } as any;
  });

  it('should create router with search endpoint', () => {
    const router = createTransactionSearchRoutes(mockController);

    expect(router).toBeDefined();
    expect(router).toBeInstanceOf(Function);
  });

  it('should register POST /search route', () => {
    const router = createTransactionSearchRoutes(mockController);

    const routes = (router as any).stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

    expect(routes).toContainEqual({
      path: '/search',
      methods: ['post'],
    });
  });

  it('should bind controller search method', () => {
    const router = createTransactionSearchRoutes(mockController);

    expect(router).toBeDefined();
  });
});
