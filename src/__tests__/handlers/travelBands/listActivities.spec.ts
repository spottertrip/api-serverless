import { listTravelBandActivities } from '@handlers/travelBands'
import { v1 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import BadRequestError from '@errors/BadRequestError';

jest.mock('@datastore/index', () => ({
  datastore: {
    listTravelBandActivities: jest.fn((travelBandId: string) => {}),
  },
}))
const datastoreMock = require('@datastore/index')

test('list travel band activities without ID returns bad request', async () => {
  const response = await listTravelBandActivities({ pathParameters: {} }, {})
  expect(response.statusCode).toBe(400)
})

test('list travel band activities with not existing ID -> not found', async () => {
  datastoreMock.datastore.listTravelBandActivities.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const event = { pathParameters: { travelBandId: v1() } }
  const response = await listTravelBandActivities(event, {})
  expect(response.statusCode).toBe(404)
})

test('datastore returns bad request', async () => {
  datastoreMock.datastore.listTravelBandActivities.mockRejectedValueOnce(new BadRequestError('invalid UUID'))
  const event = { pathParameters: { travelBandId: v1() } }
  const response = await listTravelBandActivities(event, {})
  expect(response.statusCode).toBe(400)
})

test('list travel band activities with valid ID', async () => {
  const data = [{ name: 'Activity 1' }, { name: 'Activity 2' }]
  datastoreMock.datastore.listTravelBandActivities.mockResolvedValueOnce(data)
  const event = { pathParameters: { travelBandId: v1() } }
  const response = await listTravelBandActivities(event, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(data))
})
