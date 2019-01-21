import { v4 } from 'uuid'
import BadRequestError from '@errors/BadRequestError';
import { listAvailabilities } from '@handlers/availabilities'

jest.mock('@datastore/index', () => ({
  datastore: {
    listAvailabilities: jest.fn((activityId: string) => {}),
  },
}))
const datastoreMock = require('@datastore/index')

test('list availabilities without activity ID returns bad request', async () => {
  const response = await listAvailabilities({ pathParameters: {} }, {})
  expect(response.statusCode).toBe(400)
})

// TODO: Write test for not found activity

test('datastore returns bad request', async () => {
  datastoreMock.datastore.listAvailabilities.mockRejectedValueOnce(new BadRequestError('invalid UUID'))
  const event = { pathParameters: { activityId: v4() } }
  const response = await listAvailabilities(event, {})
  expect(response.statusCode).toBe(400)
})

test('list availabilities with valid activity ID', async () => {
  const data = [{ activityId: v4() }, { activityId: v4() }]
  datastoreMock.datastore.listAvailabilities.mockResolvedValueOnce(data)
  const event = { pathParameters: { activityId: v4() } }
  const response = await listAvailabilities(event, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(data))
})
