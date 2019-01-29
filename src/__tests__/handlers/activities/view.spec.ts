import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import InternalServerError from '@errors/InternalServerError'
import { viewActivity } from '@handlers/activities'
import Activity from '@models/Activity';

jest.mock('@datastore/index', () => ({
  datastore: {
    getActivity: jest.fn((activityId: string) => {}),
    listAvailabilities: jest.fn((activityId: string) => []),
  },
}))
const datastoreMock = require('@datastore/index')

test('view activity invalid ID returns bad request', async () => {
  const response = await viewActivity({ pathParameters: {} }, {})
  expect(response.statusCode).toBe(400)
})

test('view activity with not existing ID -> not found', async () => {
  datastoreMock.datastore.getActivity.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const event = { pathParameters: { activityId: v4() } }
  const response = await viewActivity(event, {})
  expect(response.statusCode).toBe(404)
})

test('datastore returns internal error', async () => {
  datastoreMock.datastore.getActivity.mockRejectedValueOnce(new InternalServerError('database error'))
  const event = { pathParameters: { activityId: v4() } }
  const response = await viewActivity(event, {})
  expect(response.statusCode).toBe(500)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe('database error')
})

test('get activity with valid ID', async () => {
  const data = { activityId: v4(), name: 'testing activity' }
  const availabilities = [{ activityId: data.activityId }]
  datastoreMock.datastore.getActivity.mockResolvedValueOnce(data)
  datastoreMock.datastore.listAvailabilities.mockResolvedValueOnce(availabilities)
  const event = { pathParameters: { activityId: data.activityId } }
  const response = await viewActivity(event, {})
  expect(response.statusCode).toBe(200)
  const responseBody = JSON.parse(response.body) as Activity
  expect(responseBody.activityId).toBe(data.activityId)
  expect(responseBody.availabilities.length).toBe(1)
})
