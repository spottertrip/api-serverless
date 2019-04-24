import { v4 } from 'uuid'
import DatabaseError from '@errors/DatabaseError'
import { listAllBookings } from '@handlers/bookings'

jest.mock('@datastore/index', () => ({
  datastore: {
    listAllBookings: jest.fn((spotterId: string) => {}),
  },
}))
const datastoreMock = require('@datastore/index')

test('list all bookings with datastore error', async () => {
  datastoreMock.datastore.listAllBookings.mockRejectedValueOnce(new DatabaseError('db error'))
  const response = await listAllBookings({}, {})
  expect(response.statusCode).toBe(500)
})

test('list all bookings for spotter properly', async () => {
  const data = [{ bookingId: v4() }, { bookingId: v4() }]
  datastoreMock.datastore.listAllBookings.mockResolvedValueOnce(data)
  const response = await listAllBookings({}, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify({ bookings: data }))
})
