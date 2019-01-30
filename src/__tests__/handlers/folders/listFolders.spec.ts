import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import InternalServerError from '@errors/InternalServerError'
import { listFolders } from '@handlers/folders'

jest.mock('@datastore/index', () => ({
  datastore: {
    listFolders: jest.fn((travelBandId: string) => []),
    getCountActivitiesInFolder: jest.fn((travelBandId: string, folderId: string) => {}),
  },
}))
const datastoreMock = require('@datastore/index')

test('list travel band folders without ID returns bad request', async () => {
  const response = await listFolders({ pathParameters: {} }, {})
  expect(response.statusCode).toBe(400)
})

test('list travel band folders with not existing ID -> not found', async () => {
  datastoreMock.datastore.listFolders.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const event = { pathParameters: { travelBandId: v4() } }
  const response = await listFolders(event, {})
  expect(response.statusCode).toBe(404)
})

test('datastore returns internal error', async () => {
  datastoreMock.datastore.listFolders.mockRejectedValueOnce(new InternalServerError('database error'))
  const event = { pathParameters: { travelBandId: v4() } }
  const response = await listFolders(event, {})
  expect(response.statusCode).toBe(500)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe('database error')
})

test('list folders datastore error', async () => {
  datastoreMock.datastore.listFolders.mockRejectedValueOnce(new InternalServerError('database error'))
  const event = { pathParameters: { travelBandId: v4() } }
  const response = await listFolders(event, {})
  expect(response.statusCode).toBe(500)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe('database error')
})

test('list travel band folders with valid ID', async () => {
  const data = [{ folderId: v4() }]
  datastoreMock.datastore.listFolders.mockResolvedValueOnce(data)
  datastoreMock.datastore.getCountActivitiesInFolder.mockResolvedValueOnce(10)
  const event = { pathParameters: { travelBandId: v4() } }
  const response = await listFolders(event, {})
  expect(response.statusCode).toBe(200)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.length).toBe(1)
  expect(responseBody[0].nbActivities).toBe(10)
})
