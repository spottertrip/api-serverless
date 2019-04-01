
jest.mock('aws-sdk')

import { getTravelBand, listTravelBands } from '@datastore/drivers/aws/travelBands';
import InternalServerError from '@errors/InternalServerError'
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'

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
