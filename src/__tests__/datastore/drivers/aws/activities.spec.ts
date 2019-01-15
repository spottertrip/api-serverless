jest.mock('aws-sdk')

import { listTravelBandActivities, listTravelBandBookings } from '@datastore/drivers/aws/activities';
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
