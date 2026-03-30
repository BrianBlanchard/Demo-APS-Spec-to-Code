import { RequestContext } from '../request-context.type';
import { UserRole } from '../user-role.type';

describe('RequestContext', () => {
  it('should create a valid request context', () => {
    const context: RequestContext = {
      traceId: '550e8400-e29b-41d4-a716-446655440000',
      userId: '123456789',
      userRole: UserRole.CUSTOMER,
      timestamp: new Date('2024-01-15T10:30:00.000Z'),
    };

    expect(context.traceId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(context.userId).toBe('123456789');
    expect(context.userRole).toBe(UserRole.CUSTOMER);
    expect(context.timestamp).toBeInstanceOf(Date);
  });

  it('should accept all user roles', () => {
    const customerContext: RequestContext = {
      traceId: 'trace-1',
      userId: 'user-1',
      userRole: UserRole.CUSTOMER,
      timestamp: new Date(),
    };

    const csrContext: RequestContext = {
      traceId: 'trace-2',
      userId: 'user-2',
      userRole: UserRole.CSR,
      timestamp: new Date(),
    };

    const adminContext: RequestContext = {
      traceId: 'trace-3',
      userId: 'user-3',
      userRole: UserRole.ADMIN,
      timestamp: new Date(),
    };

    expect(customerContext.userRole).toBe('customer');
    expect(csrContext.userRole).toBe('csr');
    expect(adminContext.userRole).toBe('admin');
  });
});
