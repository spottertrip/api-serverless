jest.mock('aws-sdk')

import {
  getActivity,
  listActivities,
  listTravelBandActivities,
  listTravelBandBookings,
} from '@datastore/drivers/aws/activities'
import InternalServerError from '@errors/InternalServerError'
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import BadRequestError from '@errors/BadRequestError'
import NotFoundError from '@errors/NotFoundError'

AWSMock.setSDKInstance(AWS)

// ---- List Travel Band Activities ---- //
test('list travel band activities datastore error list', async () => {
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(new Error('AWS error'), null)
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedQuery)
  await expect(listTravelBandActivities(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('list travel band activities with valid ID', async () => {
  const travelBandId = v4()
  const data = [{ travelBandId, name: 'Activity 1' }, { travelBandId, name: 'Activity 2' }]
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(null, { Items: data })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedQuery)
  const activities = await listTravelBandActivities(new AWS.DynamoDB.DocumentClient(), v4())
  expect(activities.length).toBe(2)
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
    return cb(new Error('DynamoDB error'), null)
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

// ---- Get Activity ---- //

test('get activity with not existing ID -> not found', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: null })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(getActivity(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(NotFoundError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('get activity - database error', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    throw new Error('db error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(getActivity(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('get activity valid ID', async () => {
  const activityId = v4()
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: { activityId, name: 'testing' } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  const activity = await getActivity(new AWS.DynamoDB.DocumentClient(), activityId)
  expect(activity.name).toBe('testing')
  expect(activity.activityId).toBe(activityId)
  AWSMock.restore('DynamoDB.DocumentClient')
})
