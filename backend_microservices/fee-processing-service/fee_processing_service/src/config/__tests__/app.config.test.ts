import { config } from '../app.config';

describe('App Config', () => {
  it('should have required configuration values', () => {
    expect(config).toHaveProperty('env');
    expect(config).toHaveProperty('port');
    expect(config).toHaveProperty('serviceName');
    expect(config).toHaveProperty('database');
    expect(config).toHaveProperty('cors');
    expect(config).toHaveProperty('logging');
  });

  it('should have database configuration', () => {
    expect(config.database).toHaveProperty('host');
    expect(config.database).toHaveProperty('port');
    expect(config.database).toHaveProperty('name');
    expect(config.database).toHaveProperty('user');
    expect(config.database).toHaveProperty('password');
    expect(config.database).toHaveProperty('poolMin');
    expect(config.database).toHaveProperty('poolMax');
  });

  it('should have cors configuration', () => {
    expect(config.cors).toHaveProperty('origin');
  });

  it('should have logging configuration', () => {
    expect(config.logging).toHaveProperty('level');
  });
});
