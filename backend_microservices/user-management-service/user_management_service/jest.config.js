module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/config/knexfile.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      lines: 95,
      functions: 95
    }
  },
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 30000
};
