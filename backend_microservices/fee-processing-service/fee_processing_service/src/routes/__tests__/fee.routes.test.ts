import { Router } from 'express';
import { createFeeRoutes } from '../fee.routes';
import { FeeController } from '../../controllers/fee.controller';

describe('Fee Routes', () => {
  it('should create router with fee routes', () => {
    const mockController = {
      assessFee: jest.fn(),
    } as unknown as FeeController;

    const router = createFeeRoutes(mockController);

    expect(router).toBeDefined();
    expect(router instanceof Router).toBe(true);
  });
});
