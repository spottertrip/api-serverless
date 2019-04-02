import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import InternalServerError from '@errors/InternalServerError'
import Activity from '@models/Activity';
import { shareActivity } from '@handlers/activities'
import BadRequestError from '../../../errors/BadRequestError';
import DatabaseError from '@errors/DatabaseError';

jest.mock('@datastore/index', () => ({
  datastore: {
    getTravelBand: jest.fn((travelBandId: string) => {}),
    activityExistsInFolder: jest.fn((activityId: string, travelBandId: string, folderId: string) => true),
    shareActivity: jest.fn((activityId: string, travelBandId: string, folderId: string) => {}),
    getActivity: jest.fn((activityId: string) => {}),
  },
}))
const datastoreMock = require('@datastore/index')

const folderId = v4()
const usedFolderId = v4()
const travelBand = { travelBandId: v4(), folders: [{ folderId, isDefault: true }, { folderId: usedFolderId }] }

test('share activity ID returns bad request', async () => {
  const response = await shareActivity({ pathParameters: {} }, {})
  expect(response.statusCode).toBe(400)
})

test('share activity with not existing travel band ID', async () => {
  datastoreMock.datastore.getTravelBand.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const event = { pathParameters: { activityId: v4() }, body: JSON.stringify({ travelBandId: v4() }) }
  const response = await shareActivity(event, {})
  expect(response.statusCode).toBe(404)
})

test('share activity folder not provided use default', async () => {
  const activityId = v4()
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.activityExistsInFolder.mockResolvedValueOnce(false)
  datastoreMock.datastore.shareActivity.mockResolvedValueOnce({})
  const event = { pathParameters: { activityId }, body: JSON.stringify({ travelBandId: travelBand.travelBandId }) }
  await shareActivity(event, null)
  expect(datastoreMock.datastore.activityExistsInFolder).toBeCalledWith(activityId, travelBand.travelBandId, folderId)
  expect(datastoreMock.datastore.shareActivity).toBeCalledWith(activityId, travelBand.travelBandId, folderId)
})

test('share activity folder provided', async () => {
  const activityId = v4()
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.activityExistsInFolder.mockResolvedValueOnce(false)
  datastoreMock.datastore.shareActivity.mockResolvedValueOnce({})
  const body = { travelBandId: travelBand.travelBandId, folderId: usedFolderId }
  const event = { pathParameters: { activityId }, body: JSON.stringify(body) }
  await shareActivity(event, null)
  expect(datastoreMock.datastore.activityExistsInFolder).toBeCalledWith(activityId, travelBand.travelBandId, usedFolderId)
  expect(datastoreMock.datastore.shareActivity).toBeCalledWith(activityId, travelBand.travelBandId, usedFolderId)
})

test('share activity with not existing ID', async () => {
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.activityExistsInFolder.mockResolvedValueOnce(false)
  datastoreMock.datastore.shareActivity.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const event = { pathParameters: { activityId: v4() }, body: JSON.stringify({ travelBandId: v4() }) }
  const response = await shareActivity(event, {})
  expect(response.statusCode).toBe(404)
})

test('get travel band datastore returns internal error', async () => {
  datastoreMock.datastore.getTravelBand.mockRejectedValueOnce(new InternalServerError('database error'))
  const event = { pathParameters: { activityId: v4() }, body: JSON.stringify({ travelBandId: travelBand.travelBandId }) }
  const response = await shareActivity(event, {})
  expect(response.statusCode).toBe(500)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe('database error')
})

test('activity exists datastore returns internal error', async () => {
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.activityExistsInFolder.mockRejectedValueOnce(new InternalServerError('database error'))
  const event = { pathParameters: { activityId: v4() }, body: JSON.stringify({ travelBandId: travelBand.travelBandId }) }
  const response = await shareActivity(event, {})
  expect(response.statusCode).toBe(500)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe('database error')
})

test('share activity datastore returns internal error', async () => {
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.activityExistsInFolder.mockResolvedValueOnce(false)
  datastoreMock.datastore.shareActivity.mockRejectedValueOnce(new InternalServerError('database error'))
  const event = { pathParameters: { activityId: v4() }, body: JSON.stringify({ travelBandId: travelBand.travelBandId }) }
  const response = await shareActivity(event, {})
  expect(response.statusCode).toBe(500)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe('database error')
})

test('activity already present in folder', async () => {
  const activityId = v4()
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.activityExistsInFolder.mockResolvedValueOnce(true)
  const body = { travelBandId: travelBand.travelBandId, folderId: usedFolderId }
  const event = { pathParameters: { activityId }, body: JSON.stringify(body) }
  const response = await shareActivity(event, null)
  expect(response.statusCode).toBe(400)
})

test('share activity - get activity error', async () => {
  const data = {
    folderId,
    travelBandId: travelBand.travelBandId,
    activityId: v4(),
    name: 'testing activity',
  }
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.activityExistsInFolder.mockResolvedValueOnce(false)
  datastoreMock.datastore.shareActivity.mockResolvedValueOnce(true)
  datastoreMock.datastore.getActivity.mockRejectedValueOnce(new DatabaseError('db error'))
  const body = { folderId, travelBandId: travelBand.travelBandId }
  const event = { pathParameters: { activityId: data.activityId }, body: JSON.stringify(body) }
  const response = await shareActivity(event, null)
  expect(response.statusCode).toBe(500)
})

test('share activity properly', async () => {
  const data = {
    folderId,
    travelBandId: travelBand.travelBandId,
    activityId: v4(),
    name: 'testing activity',
  }
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(travelBand)
  datastoreMock.datastore.activityExistsInFolder.mockResolvedValueOnce(false)
  datastoreMock.datastore.shareActivity.mockResolvedValueOnce(true)
  datastoreMock.datastore.getActivity.mockResolvedValueOnce({ activityId: data.activityId })
  const body = { folderId, travelBandId: travelBand.travelBandId }
  const event = { pathParameters: { activityId: data.activityId }, body: JSON.stringify(body) }
  const response = await shareActivity(event, null)
  expect(response.statusCode).toBe(200)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.shared).toBeTruthy()
  expect(responseBody.activity.activityId).toBe(data.activityId)
})
