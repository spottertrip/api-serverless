import { isAuthorizedFromEvent, isAuthorizedOnTravelBand } from '@handlers/utils/auth'
import { v4 } from 'uuid'
import DatabaseError from '@errors/DatabaseError'
import UnauthorizedError from '@errors/UnauthorizedError'
import { APIGatewayProxyEvent } from 'aws-lambda'

jest.mock('@datastore/index', () => ({
  datastore: {
    getTravelBandIdsForSpotter: jest.fn((spotterId: string) => {}),
  },
}))
const datastoreMock = require('@datastore/index')

const fixtureSpotterId = v4()
const fixtureTravelBandId = v4()
const fixtureValidTravelBands = [fixtureTravelBandId]

const fixtureEvent: APIGatewayProxyEvent = {
  queryStringParameters: {},
  isBase64Encoded: false,
  httpMethod: 'POST',
  // @ts-ignore
  requestContext: {},
  stageVariables: {},
  body: '{}',
  headers: {
    'X-Spotter': fixtureSpotterId,
  },
  pathParameters: {},
}

// Is Authorized on travel band

test('is auth on travel band db error', async () => {
  datastoreMock.datastore.getTravelBandIdsForSpotter.mockRejectedValueOnce(new DatabaseError('db error'))
  await expect(isAuthorizedOnTravelBand(fixtureSpotterId, fixtureTravelBandId)).rejects.toThrow(UnauthorizedError)
  expect(datastoreMock.datastore.getTravelBandIdsForSpotter).toBeCalledWith(fixtureSpotterId)
})

test('is auth on travel band, not belong to travel band', async () => {
  datastoreMock.datastore.getTravelBandIdsForSpotter.mockResolvedValueOnce([])
  await expect(isAuthorizedOnTravelBand(fixtureSpotterId, fixtureTravelBandId)).rejects.toThrow(UnauthorizedError)
})

test('is auth on travel band, belongs to travel band', async () => {
  datastoreMock.datastore.getTravelBandIdsForSpotter.mockResolvedValueOnce(fixtureValidTravelBands)
  await isAuthorizedOnTravelBand(fixtureSpotterId, fixtureTravelBandId)
})

// Is Authorized from event

test('is auth from event, missing spotter id', async () => {
  await expect(isAuthorizedFromEvent({ ...fixtureEvent, headers: {} }, fixtureTravelBandId)).rejects.toThrow(UnauthorizedError)
})

test('is auth from event db error', async () => {
  datastoreMock.datastore.getTravelBandIdsForSpotter.mockRejectedValueOnce(new DatabaseError('db error'))
  await expect(isAuthorizedFromEvent(fixtureEvent, fixtureTravelBandId)).rejects.toThrow(UnauthorizedError)
  expect(datastoreMock.datastore.getTravelBandIdsForSpotter).toBeCalledWith(fixtureSpotterId)
})

test('is auth from event, spotter does not belong to travel band', async () => {
  datastoreMock.datastore.getTravelBandIdsForSpotter.mockResolvedValueOnce([])
  await expect(isAuthorizedFromEvent(fixtureEvent, fixtureTravelBandId)).rejects.toThrow(UnauthorizedError)
})

test('is auth from event, spotter belongs to travel band', async () => {
  datastoreMock.datastore.getTravelBandIdsForSpotter.mockResolvedValueOnce(fixtureValidTravelBands)
  await isAuthorizedFromEvent(fixtureEvent, fixtureTravelBandId)
})
