import '@testing-library/jest-dom';

if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...globalThis.crypto,
      randomUUID: () => '123e4567-e89b-12d3-a456-426614174000',
    },
    configurable: true,
  });
}

afterEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});
