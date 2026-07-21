export default {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
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
  ],
  coverageReporters: ['text', 'lcov'],
};
