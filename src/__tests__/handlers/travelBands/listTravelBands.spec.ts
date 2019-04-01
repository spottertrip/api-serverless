import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import DatabaseError from '@errors/DatabaseError';
import { listTravelBands } from '@handlers/travelBands/travelBands';

jest.mock('@datastore/index', () => ({
  datastore: {
    listTravelBands: jest.fn(() => {}),
  },
}))
const datastoreMock = require('@datastore/index')

test('list travel bands error', async () => {
  datastoreMock.datastore.listTravelBands.mockRejectedValueOnce(new DatabaseError('db error'))
  const response = await listTravelBands({}, {})
  expect(response.statusCode).toBe(500)
})

test('list travel bands valid', async () => {
  const data = [
    {
      travelBandId: v4(),
      name: 'New York',
    },
    {
      travelBandId: v4(),
      name: 'Los Angeles',
    },
  ];
  datastoreMock.datastore.listTravelBands.mockResolvedValueOnce(data)
  const response = await listTravelBands({}, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(data))
})
