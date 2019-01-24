import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import { listTravelBandSpotters } from '@handlers/travelBands/spotters';
import InternalServerError from '@errors/InternalServerError'

jest.mock('@datastore/index', () => ({
  datastore: {
    getTravelBand: jest.fn((travelBandId: string) => {}),
    listSpotters: jest.fn((travelBandId: string) => {}),
  },
}))
const datastoreMock = require('@datastore/index')
const travelBand = { travelBandId: v4() }

test('list travel band spotters without ID returns bad request', async () => {
  const response = await listTravelBandSpotters({ pathParameters: {} }, {})
  expect(response.statusCode).toBe(400)
})

test('list travel band spotters with not existing ID -> not found', async () => {
  datastoreMock.datastore.getTravelBand.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const event = { pathParameters: { travelBandId: v4() } }
  const response = await listTravelBandSpotters(event, {})
  expect(response.statusCode).toBe(404)
})

test('datastore returns internal error', async () => {
  datastoreMock.datastore.getTravelBand.mockRejectedValueOnce(new InternalServerError('database error'))
  const event = { pathParameters: { travelBandId: v4() } }
  const response = await listTravelBandSpotters(event, {})
  expect(response.statusCode).toBe(500)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe('database error')
})

test('list spotters datastore error', async () => {
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.listSpotters.mockRejectedValueOnce(new InternalServerError('database error'))
  const event = { pathParameters: { travelBandId: travelBand.travelBandId } }
  const response = await listTravelBandSpotters(event, {})
  expect(response.statusCode).toBe(500)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe('database error')
})

test('list travel band spotters with valid ID', async () => {
  const data = [{ username: 'Spotter 1' }, { username: 'Spotter 2' }]
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.listSpotters.mockResolvedValueOnce(data)
  const event = { pathParameters: { travelBandId: travelBand.travelBandId } }
  const response = await listTravelBandSpotters(event, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(data))
})
