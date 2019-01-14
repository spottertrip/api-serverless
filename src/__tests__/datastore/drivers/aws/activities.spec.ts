jest.mock('aws-sdk')

import { listTravelBandActivities } from '@datastore/drivers/aws/activities';
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import BadRequestError from '@errors/BadRequestError'
import NotFoundError from '@errors/NotFoundError'

AWSMock.setSDKInstance(AWS)

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
})
