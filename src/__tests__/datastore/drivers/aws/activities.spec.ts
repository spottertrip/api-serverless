jest.mock('aws-sdk')

import {
  activityExistsInFolder,
  getActivity,
  listActivities,
  listTravelBandActivities,
  shareActivity,
} from '@datastore/drivers/aws/activities'
import InternalServerError from '@errors/InternalServerError'
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import NotFoundError from '@errors/NotFoundError'
import DatabaseError from '@errors/DatabaseError';
import { FilterActivitiesOptions } from '@datastore/types';

AWSMock.setSDKInstance(AWS)

const fixtureOptions: FilterActivitiesOptions = {
  itemsPerPage: 24,
  q: '',
  priceMax: 100,
  priceMin: 10,
  lastEvaluatedId: v4(),
  category: v4(),
}

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

// ---- List Activities ---- //

test('List activities with valid last evaluated id', async () => {
  const mockedList = jest.fn((params: AWS.DynamoDB.DocumentClient.ScanInput, cb: any) => {
    expect(params.ExclusiveStartKey.activityId).toBe(fixtureOptions.lastEvaluatedId)
    expect(params.Limit).toBe(10)
    return cb(null, { Items: [{ activiyId: v4() }], LastEvaluatedKey: { activityId: fixtureOptions.lastEvaluatedId } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', mockedList)
  const results = await listActivities(new AWS.DynamoDB.DocumentClient(), { ...fixtureOptions, itemsPerPage: 10 })
  expect(results.activities.length).toBe(1)
  expect(results.lastEvaluatedId).toBe(fixtureOptions.lastEvaluatedId)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('List activities dynamodb error', async () => {
  const mockedError = jest.fn((params: any, cb: any) => {
    return cb(new Error('DynamoDB error'), null)
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', mockedError)
  await expect(listActivities(new AWS.DynamoDB.DocumentClient(), fixtureOptions)).rejects.toThrow(InternalServerError)
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
  const options: FilterActivitiesOptions = {
    lastEvaluatedId: '',
    itemsPerPage: 10,
    priceMin: 0,
    priceMax: 0,
    category: '',
    q: '',
  }
  const results = await listActivities(new AWS.DynamoDB.DocumentClient(), options)
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

// ---- Activity Exists in Folder ---- //

test('activity does not exist', async () => {
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(null, { Count: 0 })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedQuery)
  const exists = await activityExistsInFolder(new AWS.DynamoDB.DocumentClient(), v4(), v4(), v4())
  expect(exists).toBeFalsy()
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('activty exists - database error', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    throw new Error('db error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedGet)
  await expect(activityExistsInFolder(new AWS.DynamoDB.DocumentClient(), v4(), v4(), v4())).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('activty exists', async () => {
  const activityId = v4()
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Count: 1 })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedGet)
  const response = await activityExistsInFolder(new AWS.DynamoDB.DocumentClient(), v4(), v4(), v4())
  expect(response).toBeTruthy()
  AWSMock.restore('DynamoDB.DocumentClient')
})

// ---- Share Activity ---- //

test('share activity - activity not found', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: null })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(shareActivity(new AWS.DynamoDB.DocumentClient(), v4(), v4(), v4())).rejects.toThrow(NotFoundError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('activty exists - database error', async () => {
  const activityId = v4()
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: { activityId } })
  })
  const mockedTransaction = jest.fn((params: any, cb: any) => {
    throw new Error('db error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  AWSMock.mock('DynamoDB.DocumentClient', 'transactWrite', mockedTransaction)
  await expect(shareActivity(new AWS.DynamoDB.DocumentClient(), v4(), v4(), v4())).rejects.toThrow(DatabaseError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('activity shared properly', async () => {
  const activityId = v4()
  const folderId = v4()
  const travelBandId = v4()
  const sharedActivity = {
    activityId,
    folderId,
    travelBandId,
    name: 'testing',
    pictures: ['picture'],
    price: 100,
    mark: 3.8,
    nbVotes: 100,
    location: {},
  }
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: sharedActivity })
  })
  const mockedTransaction = jest.fn((params: any, cb: any) => {
    return cb(null, {})
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  AWSMock.mock('DynamoDB.DocumentClient', 'transactWrite', mockedTransaction)
  const response = await shareActivity(new AWS.DynamoDB.DocumentClient(), activityId, travelBandId, folderId)
  expect(response).toBe(true)
  AWSMock.restore('DynamoDB.DocumentClient')
})
