import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import { listBookingsForTravelBand } from '@handlers/bookings'

jest.mock('@datastore/index', () => ({
  datastore: {
    getTravelBand: jest.fn((travelBandId: string) => {}),
    listBookingsForTravelBand: jest.fn((travelBandId: string) => {}),
  },
}))
const datastoreMock = require('@datastore/index')

test('list travel band bookings without ID returns bad request', async () => {
  const response = await listBookingsForTravelBand({}, {})
  expect(response.statusCode).toBe(400)
})

test('list travel band bookings with not existing ID -> not found', async () => {
  datastoreMock.datastore.getTravelBand.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const event = { pathParameters: { travelBandId: v4() } }
  const response = await listBookingsForTravelBand(event, {})
  expect(response.statusCode).toBe(404)
})

test('list travel band bookings with valid ID', async () => {
  const travelBandId = v4()
  const bookingId = v4()
  const data = [{
    travelBandId,
    bookingId,
    activity: {
      activityId: v4(),
      price: 100,
    },
  }]
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce({ travelBandId })
  datastoreMock.datastore.listBookingsForTravelBand.mockResolvedValueOnce(data)
  const event = { pathParameters: { travelBandId } }
  const response = await listBookingsForTravelBand(event, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(data))
})
