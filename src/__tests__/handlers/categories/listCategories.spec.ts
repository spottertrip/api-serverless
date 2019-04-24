import { v4 } from 'uuid'
import { listCategories } from '@handlers/categories/listCategories';
import DatabaseError from '@errors/DatabaseError';
import { ICategory } from '@models/Category';

jest.mock('@datastore/index', () => ({
  datastore: {
    listCategories: jest.fn(() => {}),
  },
}))
const datastoreMock = require('@datastore/index')

jest.mock('@helpers/translations', () => ({
  translateCategories: jest.fn((categories: ICategory[]) => categories),
}))
require('@helpers/translations')

test('datastore returns internal error', async () => {
  datastoreMock.datastore.listCategories.mockRejectedValueOnce(new DatabaseError('db error'))
  const response = await listCategories({}, {})
  expect(response.statusCode).toBe(500)
})

test('list categories valid', async () => {
  const data = [{ categoryId: v4() }, { categoryId: v4() }]
  datastoreMock.datastore.listCategories.mockResolvedValueOnce(data)
  const response = await listCategories({}, {})
  expect(response.statusCode).toBe(200)
  const parsedResponse = JSON.parse(response.body)
  expect(parsedResponse.count).toBe(2)
  expect(parsedResponse.categories.length).toBe(2)
})
