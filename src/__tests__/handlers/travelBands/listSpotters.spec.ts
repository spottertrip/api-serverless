import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import BadRequestError from '@errors/BadRequestError';
import { listTravelBandSpotters } from '@handlers/travelBands/spotters';

jest.mock('@datastore/index', () => ({
  datastore: {
    listSpotters: jest.fn((travelBandId: string) => {}),
  },
}))
const datastoreMock = require('@datastore/index')

test('list travel band spotters without ID returns bad request', async () => {
  const response = await listTravelBandSpotters({}, {})
  expect(response.statusCode).toBe(400)
})

test('list travel band spotters with not existing ID -> not found', async () => {
  datastoreMock.datastore.listSpotters.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const event = { pathParameters: { travelBandId: v4() } }
  const response = await listTravelBandSpotters(event, {})
  expect(response.statusCode).toBe(404)
})

test('datastore returns bad request', async () => {
  datastoreMock.datastore.listSpotters.mockRejectedValueOnce(new BadRequestError('invalid UUID'))
  const event = { pathParameters: { travelBandId: v4() } }
  const response = await listTravelBandSpotters(event, {})
  expect(response.statusCode).toBe(400)
})

test('list travel band spotters with valid ID', async () => {
  const data = [{ username: 'Spotter 1' }, { username: 'Spotter 2' }]
  datastoreMock.datastore.listSpotters.mockResolvedValueOnce(data)
  const event = { pathParameters: { travelBandId: v4() } }
  const response = await listTravelBandSpotters(event, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(data))
})
