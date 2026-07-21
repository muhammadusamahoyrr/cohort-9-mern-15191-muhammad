export default {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  // Only *.test.* files are suites. Without this, everything under
  // __tests__/helpers/ would be collected and fail as an empty suite.
  testMatch: ['<rootDir>/src/**/*.test.{js,jsx}'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    // src/config/env.js is the only file that touches import.meta, which Jest
    // cannot parse. Swap it for a fixed stub instead of teaching Babel about it.
    '^.*/config/env$': '<rootDir>/src/__mocks__/env.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/config/env.js',
    '!src/__mocks__/**',
    '!src/__tests__/helpers/**',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { statements: 80, branches: 70, functions: 80, lines: 80 },
  },
};
