import { extractServerFieldErrors } from '../../utils/errors';

describe('Utils: errors', () => {
  it('maps array of details into keyed object', () => {
    const details = [
      { field: 'email', message: 'Email is required' },
      { path: 'password', message: 'Password is too short' },
    ];
    expect(extractServerFieldErrors(details)).toEqual({
      email: 'Email is required',
      password: 'Password is too short',
    });
  });

  it('handles non-array inputs safely', () => {
    expect(extractServerFieldErrors(null)).toEqual({});
    expect(extractServerFieldErrors(undefined)).toEqual({});
    expect(extractServerFieldErrors({})).toEqual({});
  });

  it('keeps the first error message if duplicates exist for the same field', () => {
    const details = [
      { field: 'email', message: 'First error' },
      { field: 'email', message: 'Second error' },
    ];
    expect(extractServerFieldErrors(details)).toEqual({
      email: 'First error',
    });
  });
});
