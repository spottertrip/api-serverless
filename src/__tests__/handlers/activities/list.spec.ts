import { v4 } from 'uuid'
import { listActivities } from '@handlers/activities';

jest.mock('@datastore/index', () => ({
  datastore: {
    listActivities: jest.fn((lastEvaluatedId: string, itemsPerPage: number) => {}),
  },
}))
const datastoreMock = require('@datastore/index')

// Mock for valid activities listing response
const lastEvaluatedId = v4()
const activities = [
  { activityId: v4() },
  { activityId: lastEvaluatedId },
]
const mockValidData = {
  activities,
  lastEvaluatedId,
}

test('list activities withtout pagination', async () => {
  datastoreMock.datastore.listActivities.mockResolvedValueOnce(mockValidData)
  const event = { queryStringParameters: {} }
  const response = await listActivities(event, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(mockValidData))
  expect(datastoreMock.datastore.listActivities).toBeCalledWith({
    lastEvaluatedId: '',
    itemsPerPage: 20,
    q: '',
    category: '',
    priceMin: 0,
    priceMax: 0,
  })
})

test('list activities with itemsPerPage: 5', async () => {
  datastoreMock.datastore.listActivities.mockResolvedValueOnce(mockValidData)
  const event = { queryStringParameters: { itemsPerPage: 5 } }
  const response = await listActivities(event, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(mockValidData))
  expect(datastoreMock.datastore.listActivities).toBeCalledWith({
    lastEvaluatedId: '',
    itemsPerPage: 5,
    q: '',
    category: '',
    priceMin: 0,
    priceMax: 0,
  })
})

test('list activities with invalid lastEvaluatedId return bad request', async () => {
  const event = { queryStringParameters: { lastEvaluatedId: 'invalidUUID' } }
  const response = await listActivities(event, {})
  expect(response.statusCode).toBe(400)
})
