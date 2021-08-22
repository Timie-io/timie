export const MockRepository = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
  create: jest.fn((entity) => entity),
  save: jest.fn((entity) => entity),
  findOne: jest.fn((entity) => entity),
}));
