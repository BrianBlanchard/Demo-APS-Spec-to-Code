import { Response, NextFunction } from 'express';
import { CustomerController } from '../../src/controllers/customer.controller';
import { ICustomerService } from '../../src/services/customer.service';
import { CreateCustomerResponse, CustomerStatus, VerificationStatus } from '../../src/types/customer.types';
import { AuthenticatedRequest } from '../../src/middleware/auth.middleware';

describe('CustomerController', () => {
  let customerController: CustomerController;
  let mockCustomerService: jest.Mocked<ICustomerService>;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockCustomerService = {
      createCustomer: jest.fn(),
    };

    customerController = new CustomerController(mockCustomerService);

    mockRequest = {
      body: {
        firstName: 'John',
        lastName: 'Anderson',
        dateOfBirth: '1985-06-15',
        ssn: '123-45-6789',
        governmentId: 'DL12345678',
        addressLine1: '123 Main Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        phone1: '312-555-0123',
        isPrimaryCardholder: true,
        ficoScore: 720,
      },
      user: {
        id: 'USER123',
        role: 'CSR',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('createCustomer', () => {
    it('should create customer and return 201 response', async () => {
      const expectedResponse: CreateCustomerResponse = {
        customerId: '123456789',
        status: CustomerStatus.ACTIVE,
        createdAt: '2024-01-15T10:30:00Z',
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 5000,
      };

      mockCustomerService.createCustomer.mockResolvedValue(expectedResponse);

      await customerController.createCustomer(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockCustomerService.createCustomer).toHaveBeenCalledWith(mockRequest.body, 'USER123');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should use SYSTEM as userId when user is not authenticated', async () => {
      const requestWithoutUser = { ...mockRequest, user: undefined };
      const expectedResponse: CreateCustomerResponse = {
        customerId: '123456789',
        status: CustomerStatus.ACTIVE,
        createdAt: '2024-01-15T10:30:00Z',
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 5000,
      };

      mockCustomerService.createCustomer.mockResolvedValue(expectedResponse);

      await customerController.createCustomer(
        requestWithoutUser as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockCustomerService.createCustomer).toHaveBeenCalledWith(mockRequest.body, 'SYSTEM');
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Service error');
      mockCustomerService.createCustomer.mockRejectedValue(error);

      await customerController.createCustomer(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle request with optional fields', async () => {
      mockRequest.body = {
        ...mockRequest.body,
        middleName: 'Michael',
        addressLine2: 'Apt 4B',
        phone2: '312-555-0456',
      };

      const expectedResponse: CreateCustomerResponse = {
        customerId: '987654321',
        status: CustomerStatus.ACTIVE,
        createdAt: '2024-01-15T10:30:00Z',
        verificationStatus: VerificationStatus.PENDING,
        creditLimit: 5000,
      };

      mockCustomerService.createCustomer.mockResolvedValue(expectedResponse);

      await customerController.createCustomer(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockCustomerService.createCustomer).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should handle manual review required status', async () => {
      const expectedResponse: CreateCustomerResponse = {
        customerId: '123456789',
        status: CustomerStatus.ACTIVE,
        createdAt: '2024-01-15T10:30:00Z',
        verificationStatus: VerificationStatus.MANUAL_REVIEW_REQUIRED,
        creditLimit: 5000,
      };

      mockCustomerService.createCustomer.mockResolvedValue(expectedResponse);

      await customerController.createCustomer(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          verificationStatus: VerificationStatus.MANUAL_REVIEW_REQUIRED,
        })
      );
    });
  });
});
