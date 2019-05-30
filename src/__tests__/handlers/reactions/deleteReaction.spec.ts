import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import DatabaseError from '@errors/DatabaseError'
import ISpotter from '@models/Spotter'
import { deleteReaction } from '@handlers/travelBands/reactions/deleteReaction'
import Activity from '@models/Activity'

jest.mock('@datastore/index', () => ({
  datastore: {
    getSpotter: jest.fn((spotterId: string) => {}),
    getTravelBandActivity: jest.fn((travelBandId: string, activityId: string) => {}),
    updateTravelBandActivity: jest.fn((activity: Activity) => {
      expect(activity.reactions.length).toBe(0)
    }),
  },
}))
const datastoreMock = require('@datastore/index')

const fixtureTravelBandId = v4()
const fixtureSpotter: ISpotter = {
  spotterId: v4(),
  username: 'testing user',
  email: 'testing@testing.fr',
  thumbnailUrl: 'doesnotmatter',
  travelBands: [fixtureTravelBandId],
}
const fixtureActivity = {
  travelBandId: fixtureTravelBandId,
  activityId: v4(),
  reactions: [
    { ...fixtureSpotter, like: false },
  ],
}
const fixtureEvent = {
  pathParameters: {
    activityId: fixtureActivity.activityId,
    travelBandId: fixtureTravelBandId,
  },
}

test('spotter does not exist', async () => {
  datastoreMock.datastore.getSpotter.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const response = await deleteReaction(fixtureEvent)
  expect(response.statusCode).toBe(404)
})

test('get spotter internal error', async () => {
  datastoreMock.datastore.getSpotter.mockRejectedValueOnce(new DatabaseError('database error'))
  const response = await deleteReaction(fixtureEvent)
  expect(response.statusCode).toBe(500)
})

test('invalid travel band id', async () => {
  const event = {
    ...fixtureEvent,
    pathParameters: {
      activityId: fixtureActivity.activityId,
      travelBandId: '',
    },
  }
  const response = await deleteReaction(event)
  expect(response.statusCode).toBe(400)
})

test('invalid activity id', async () => {
  const event = {
    ...fixtureEvent,
    pathParameters: {
      activityId: '',
      travelBandId: fixtureTravelBandId,
    },
  }
  const response = await deleteReaction(event)
  expect(response.statusCode).toBe(400)
})

test('spotter not invited to travel band', async () => {
  datastoreMock.datastore.getSpotter.mockResolvedValueOnce({ ...fixtureSpotter, travelBands: [] })
  const response = await deleteReaction(fixtureEvent)
  expect(response.statusCode).toBe(401)
})

test('get travel band activity not found', async () => {
  datastoreMock.datastore.getSpotter.mockResolvedValueOnce(fixtureSpotter)
  datastoreMock.datastore.getTravelBandActivity.mockRejectedValueOnce(new NotFoundError('not found'))
  const response = await deleteReaction(fixtureEvent)
  expect(response.statusCode).toBe(404)
})

test('get travel band activity db error', async () => {
  datastoreMock.datastore.getSpotter.mockResolvedValueOnce(fixtureSpotter)
  datastoreMock.datastore.getTravelBandActivity.mockRejectedValueOnce(new DatabaseError('db error'))
  const response = await deleteReaction(fixtureEvent)
  expect(response.statusCode).toBe(500)
})

test('remove reaction to activity properly, no previous reaction', async () => {
  datastoreMock.datastore.getSpotter.mockResolvedValueOnce(fixtureSpotter)
  datastoreMock.datastore.getTravelBandActivity.mockResolvedValueOnce({ ...fixtureActivity, reactions: [] })
  const response = await deleteReaction(fixtureEvent)
  expect(response.statusCode).toBe(404)
})

test('remove reaction to activity properly', async () => {
  datastoreMock.datastore.getSpotter.mockResolvedValueOnce(fixtureSpotter)
  datastoreMock.datastore.getTravelBandActivity.mockResolvedValueOnce({ ...fixtureActivity })
  datastoreMock.datastore.updateTravelBandActivity.mockResolvedValueOnce(null)
  const response = await deleteReaction(fixtureEvent)
  expect(response.statusCode).toBe(200)
  const data = JSON.parse(response.body)
  expect(data.spotterId).toBe(fixtureSpotter.spotterId)
})

test('remove reaction database error', async () => {
  datastoreMock.datastore.getSpotter.mockResolvedValueOnce(fixtureSpotter)
  datastoreMock.datastore.getTravelBandActivity.mockResolvedValueOnce(fixtureActivity)
  datastoreMock.datastore.updateTravelBandActivity.mockRejectedValueOnce(new DatabaseError('db error'))
  const response = await deleteReaction(fixtureEvent)
  expect(response.statusCode).toBe(500)
})
