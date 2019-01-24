jest.mock('aws-sdk')

import { listActivities, listTravelBandActivities, listTravelBandBookings } from '@datastore/drivers/aws/activities'
import InternalServerError from '@errors/InternalServerError'
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import BadRequestError from '@errors/BadRequestError'
import NotFoundError from '@errors/NotFoundError'

AWSMock.setSDKInstance(AWS)

// ---- List Travel Band Activities ---- //
test('list travel band activities without ID returns bad request', async () => {
  await expect(listTravelBandActivities(new AWS.DynamoDB.DocumentClient(), '')).rejects.toThrow(BadRequestError)
})

test('list travel band activities with not existing ID -> not found', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: null })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(listTravelBandActivities(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(NotFoundError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('list travel band activities with valid ID', async () => {
  const activityName = 'test Activity'
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: { activities: [{ name: activityName }] } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  const activities = await listTravelBandActivities(new AWS.DynamoDB.DocumentClient(), v4())
  expect(activities.length).toBe(1)
  expect(activities[0].name).toBe(activityName)
  AWSMock.restore('DynamoDB.DocumentClient')
})

// ---- List travel band Bookings ---- //

test('list travel band bookings without ID returns bad request', async () => {
  await expect(listTravelBandBookings(new AWS.DynamoDB.DocumentClient(), '')).rejects.toThrow(BadRequestError)
})

test('list travel band bookings with not existing ID -> not found', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: null })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(listTravelBandBookings(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(NotFoundError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('list travel band bookings with valid ID', async () => {
  const activityName = 'test Activity'
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: { bookings: [{ name: activityName }] } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  const activities = await listTravelBandBookings(new AWS.DynamoDB.DocumentClient(), v4())
  expect(activities.length).toBe(1)
  expect(activities[0].name).toBe(activityName)
  AWSMock.restore('DynamoDB.DocumentClient')
})

// ---- List Activities ---- //

test('List activities with valid last evaluated id', async () => {
  const lastEvaluatedId = v4()
  const mockedList = jest.fn((params: AWS.DynamoDB.DocumentClient.ScanInput, cb: any) => {
    expect(params.ExclusiveStartKey.activityId).toBe(lastEvaluatedId)
    expect(params.Limit).toBe(10)
    return cb(null, { Items: [{ activiyId: v4() }], LastEvaluatedKey: { activityId: lastEvaluatedId } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', mockedList)
  const results = await listActivities(new AWS.DynamoDB.DocumentClient(), lastEvaluatedId, 10)
  expect(results.activities.length).toBe(1)
  expect(results.lastEvaluatedId).toBe(lastEvaluatedId)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('List activities dynamodb error', async () => {
  const mockedError = jest.fn((params: any, cb: any) => {
    throw new Error('DynamoDB error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', mockedError)
  await expect(listActivities(new AWS.DynamoDB.DocumentClient())).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('List activities with default pagination', async () => {
  const lastEvaluatedId = v4()
  const mockedList = jest.fn((params: AWS.DynamoDB.DocumentClient.ScanInput, cb: any) => {
    expect(params.ExclusiveStartKey).toBeUndefined()
    expect(params.Limit).toBe(10)
    return cb(null, { Items: [{ activityId: lastEvaluatedId }], LastEvaluatedKey: { activityId: lastEvaluatedId } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', mockedList)
  const results = await listActivities(new AWS.DynamoDB.DocumentClient(), '', 10)
  expect(results.activities.length).toBe(1)
  expect(results.lastEvaluatedId).toBe(lastEvaluatedId)
  AWSMock.restore('DynamoDB.DocumentClient')
})
