import { v4 } from 'uuid'
import DatabaseError from '@errors/DatabaseError';
import { listTravelBands } from '@handlers/travelBands/travelBands'
import UnauthorizedError from '@errors/UnauthorizedError';

// authorizations
jest.mock('@handlers/utils/auth', () => ({
  getSpotterIdFromEvent: jest.fn((event) => {}),
}))
const authMock = require('@handlers/utils/auth')

jest.mock('@datastore/index', () => ({
  datastore: {
    listTravelBandsForSpotter: jest.fn(() => {}),
  },
}))
const datastoreMock = require('@datastore/index')

// data

const fixtureSpotterId = v4()

test('list travel bands auth error', async () => {
  authMock.getSpotterIdFromEvent.mockRejectedValueOnce(new UnauthorizedError('auth error'))
  const response = await listTravelBands({}, {})
  expect(response.statusCode).toBe(401)
})

test('list travel bands db error', async () => {
  authMock.getSpotterIdFromEvent.mockResolvedValueOnce(fixtureSpotterId)
  datastoreMock.datastore.listTravelBandsForSpotter.mockRejectedValueOnce(new DatabaseError('db error'))
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
  authMock.getSpotterIdFromEvent.mockResolvedValueOnce(fixtureSpotterId)
  datastoreMock.datastore.listTravelBandsForSpotter.mockResolvedValueOnce(data)
  const response = await listTravelBands({}, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(data))
})
