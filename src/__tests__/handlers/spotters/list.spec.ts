import { v4 } from 'uuid'
import { listSpotters } from '@handlers/spotters/list'
import DatabaseError from '@errors/DatabaseError'

jest.mock('@datastore/index', () => ({
  datastore: {
    searchSpotters: jest.fn((query: string) => []),
  },
}))
const datastoreMock = require('@datastore/index')

// Mock for valid spottters listing response
const spotters = [
  {
    spotterId: v4(),
    email: 'testing@testing.fr',
    username: 'testing',
    travelBands: [],
    thumbnailUrl: 'thumbnail',
  },
  {
    spotterId: v4(),
    email: 'second@second.fr',
    username: 'second',
    travelBands: [],
    thumbnailUrl: 'thumbnail',
  },
]

test('list spotters with query', async () => {
  datastoreMock.datastore.searchSpotters.mockResolvedValueOnce(spotters)
  const event = { queryStringParameters: { q: 'test' } }
  const response = await listSpotters(event, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(spotters))
})

test('list spotters without query', async () => {
  const event = { queryStringParameters: {} }
  const response = await listSpotters(event, {})
  expect(response.statusCode).toBe(400)
})

test('list spotters with empty query', async () => {
  const event = { queryStringParameters: { q: '' } }
  const response = await listSpotters(event, {})
  expect(response.statusCode).toBe(400)
})

test('list spotters with empty query - space', async () => {
  const event = { queryStringParameters: { q: ' ' } }
  const response = await listSpotters(event, {})
  expect(response.statusCode).toBe(400)
})

test('list spotters with datastore error', async () => {
  datastoreMock.datastore.searchSpotters.mockRejectedValueOnce(new DatabaseError('db error'))
  const event = { queryStringParameters: { q: 'test' } }
  const response = await listSpotters(event, {})
  expect(response.statusCode).toBe(500)
})
