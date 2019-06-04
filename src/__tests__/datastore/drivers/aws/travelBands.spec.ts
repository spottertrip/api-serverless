
jest.mock('aws-sdk')

import { getTravelBand, listTravelBands, createTravelBand } from '@datastore/drivers/aws/travelBands'
import InternalServerError from '@errors/InternalServerError'
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import { getTravelBandIdsForSpotter } from '@datastore/drivers/aws/spotters'
import DatabaseError from '@errors/DatabaseError'
import { defaultTravelBandThumbnail } from '@constants/defaults'
import TravelBand from '@models/TravelBand';

AWSMock.setSDKInstance(AWS)

// ---- List Travel Band Activities ---- //
test('get travel band with not existing ID -> not found', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: null })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(getTravelBand(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(NotFoundError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('get travel band - database error', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    throw new Error('db error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(getTravelBand(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('get travel band with valid ID', async () => {
  const travelBandId = v4()
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: { travelBandId, name: 'testing' } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  const travelBand = await getTravelBand(new AWS.DynamoDB.DocumentClient(), travelBandId)
  expect(travelBand.name).toBe('testing')
  expect(travelBand.travelBandId).toBe(travelBandId)
  AWSMock.restore('DynamoDB.DocumentClient')
})

// ---- List travel bands --- //

test('list travel bands return unknown error', async () => {
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(new Error('database error'), null)
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', mockedQuery)
  await expect(listTravelBands(new AWS.DynamoDB.DocumentClient())).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('list travel bands with not existing ID -> not found', async () => {
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(null, {
      Items: [
        { travelBandId: v4(), name: 'New York' },
        { travelBandId: v4(), name: 'Los Angeles' },
      ],
    })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', mockedQuery)
  const travelBands = await listTravelBands(new AWS.DynamoDB.DocumentClient())
  expect(travelBands.length).toBe(2)
  AWSMock.restore('DynamoDB.DocumentClient')
})

// --- List Travel Band IDs for a spotter

test('get travel bands for spotter with not existing ID -> not found', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: null })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(getTravelBandIdsForSpotter(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(NotFoundError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('get travel bands for spotter - database error', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    throw new Error('db error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(getTravelBandIdsForSpotter(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(DatabaseError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('get travel band ids for spotters with valid ID', async () => {
  const spotterId = v4()
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: { travelBands: [v4(), v4(), v4()] } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  const travelBands = await getTravelBandIdsForSpotter(new AWS.DynamoDB.DocumentClient(), spotterId)
  expect(travelBands.length).toBe(3)
  AWSMock.restore('DynamoDB.DocumentClient')
})

// ---- Create Travel Band ---- //

const fixtureTravelBand: TravelBand = {
  travelBandId: v4(),
  name: 'testing',
  thumbnailUrl: defaultTravelBandThumbnail,
  description: '',
  folders: [],
  bookings: [],
  spotters: [
    {
      spotterId: v4(),
      username: 'testing user',
      email: 'test@test.fr',
      thumbnailUrl: 'thumbnail',
    },
  ],
  activityCount: 0,
}

test('travel band created properly', async () => {
  const mockedPut = jest.fn((params: any, cb: any) => cb(null, {}));
  AWSMock.mock('DynamoDB.DocumentClient', 'transactWrite', mockedPut)
  const response = await createTravelBand(new AWS.DynamoDB.DocumentClient(), fixtureTravelBand);
  expect(response.travelBandId).toBe(fixtureTravelBand.travelBandId)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('travel band db error', async () => {
  const mockedPut = jest.fn((params: any, cb: any) => {
    throw new Error('Datastore error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'transactWrite', mockedPut)
  await expect(createTravelBand(new AWS.DynamoDB.DocumentClient(), fixtureTravelBand)).rejects.toThrow(DatabaseError)
})
