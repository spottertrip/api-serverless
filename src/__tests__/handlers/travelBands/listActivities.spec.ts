import { listTravelBandActivities } from '@handlers/travelBands'
import { v1 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import InternalServerError from '@errors/InternalServerError'

jest.mock('@datastore/index', () => ({
  datastore: {
    getTravelBand: jest.fn((travelBandId: string) => {}),
    listTravelBandActivities: jest.fn((travelBandId: string) => {}),
  },
}))
const datastoreMock = require('@datastore/index')
const travelBand = {
  travelBandId: v1(),
  name: 'travel test',
  description: 'test description',
}

test('list travel band activities without ID returns bad request', async () => {
  const response = await listTravelBandActivities({ pathParameters: {} }, {})
  expect(response.statusCode).toBe(400)
})

test('list travel band activities with not existing ID -> not found', async () => {
  datastoreMock.datastore.getTravelBand.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const event = { pathParameters: { travelBandId: v1() } }
  const response = await listTravelBandActivities(event, {})
  expect(response.statusCode).toBe(404)
})

test('datastore get activities returns error', async () => {
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.listTravelBandActivities.mockRejectedValueOnce(new InternalServerError('datastore error'))
  const event = { pathParameters: { travelBandId: travelBand.travelBandId } }
  const response = await listTravelBandActivities(event, {})
  expect(response.statusCode).toBe(500)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe('datastore error')
})

test('list travel band activities with valid ID', async () => {
  const data = [{ travelBandId: travelBand.travelBandId, name: 'Activity 1' }, { travelBandId: travelBand.travelBandId, name: 'Activity 2' }]
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.listTravelBandActivities.mockResolvedValueOnce(data)
  const event = { pathParameters: { travelBandId: v1() } }
  const response = await listTravelBandActivities(event, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(data))
})
