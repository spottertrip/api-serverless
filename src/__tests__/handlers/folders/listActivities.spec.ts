import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import InternalServerError from '@errors/InternalServerError'
import { listActivitiesInFolder } from '@handlers/folders'

jest.mock('@datastore/index', () => ({
  datastore: {
    getFolder: jest.fn((travelBandId: string, folderId: string) => {}),
    listActivitiesInFolder: jest.fn((travelBandId: string, folderId: string) => []),
  },
}))
const datastoreMock = require('@datastore/index')

test('list folder activities without ID returns bad request', async () => {
  const response = await listActivitiesInFolder({ pathParameters: {} }, {})
  expect(response.statusCode).toBe(400)
})

test('list folder activiites with invalid ID', async () => {
  const pathParametersInvalid = {
    travelBandId: v4(),
    folderId: 'invalid',
  }
  const response = await listActivitiesInFolder({ pathParameters: pathParametersInvalid }, null)
  expect(response.statusCode).toBe(400)
})

test('list folder activities with not existing ID -> not found', async () => {
  datastoreMock.datastore.getFolder.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const event = { pathParameters: { travelBandId: v4(), folderId: v4() } }
  const response = await listActivitiesInFolder(event, {})
  expect(response.statusCode).toBe(404)
})

test('datastore returns internal error', async () => {
  datastoreMock.datastore.getFolder.mockRejectedValueOnce(new InternalServerError('database error'))
  const event = { pathParameters: { travelBandId: v4(), folderId: v4() } }
  const response = await listActivitiesInFolder(event, {})
  expect(response.statusCode).toBe(500)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe('database error')
})

test('list activities in folder datastore error', async () => {
  const folderId = v4()
  datastoreMock.datastore.getFolder.mockResolvedValueOnce({ folders: { folderId } })
  datastoreMock.datastore.listActivitiesInFolder.mockRejectedValueOnce(new InternalServerError('database error'))
  const event = { pathParameters: { travelBandId: v4(), folderId: v4() } }
  const response = await listActivitiesInFolder(event, {})
  expect(response.statusCode).toBe(500)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe('database error')
})

test('list folder activities with valid ID', async () => {
  const folderData = { folderId: v4() }
  const activities = [{ activityId: v4() }, { activityId: v4() }]
  datastoreMock.datastore.getFolder.mockResolvedValueOnce(folderData)
  datastoreMock.datastore.listActivitiesInFolder.mockResolvedValueOnce(activities)
  const event = { pathParameters: { travelBandId: v4(), folderId: folderData.folderId } }
  const response = await listActivitiesInFolder(event, {})
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(JSON.stringify(activities))
})
