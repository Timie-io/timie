export const MockRedis = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
}));
