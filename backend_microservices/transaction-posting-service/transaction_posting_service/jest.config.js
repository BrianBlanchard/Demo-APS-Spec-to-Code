module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      lines: 95,
      functions: 95,
    },
  },
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 30000,
};
