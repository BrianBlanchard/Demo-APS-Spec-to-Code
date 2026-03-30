import { UserRole } from '../user-role.type';

describe('UserRole', () => {
  it('should have CUSTOMER role', () => {
    expect(UserRole.CUSTOMER).toBe('customer');
  });

  it('should have CSR role', () => {
    expect(UserRole.CSR).toBe('csr');
  });

  it('should have ADMIN role', () => {
    expect(UserRole.ADMIN).toBe('admin');
  });

  it('should have exactly 3 roles', () => {
    const roles = Object.values(UserRole);
    expect(roles).toHaveLength(3);
  });

  it('should contain only expected role values', () => {
    const roles = Object.values(UserRole);
    expect(roles).toEqual(expect.arrayContaining(['customer', 'csr', 'admin']));
  });
});
