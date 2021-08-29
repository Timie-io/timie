export const MockRepository = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  findAndCount: jest.fn(),
}));
