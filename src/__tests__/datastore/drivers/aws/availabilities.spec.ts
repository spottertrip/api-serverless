import { listAvailabilities } from '@datastore/drivers/aws/availabilities'

jest.mock('aws-sdk')

import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import BadRequestError from '@errors/BadRequestError'
import InternalServerError from '@errors/InternalServerError'

AWSMock.setSDKInstance(AWS)

test('list availabilities without ID returns bad request', async () => {
  await expect(listAvailabilities(new AWS.DynamoDB.DocumentClient(), '')).rejects.toThrow(BadRequestError)
})

test('list availabilities return unknown error', async () => {
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(new Error('database error'), null)
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedQuery)
  await expect(listAvailabilities(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('list availabilities with not existing ID -> not found', async () => {
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(null, {
      Items: [
        { activityId: v4() },
        { activityId: v4() },
      ],
    })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedQuery)
  const availabilities = await listAvailabilities(new AWS.DynamoDB.DocumentClient(), v4())
  expect(availabilities.length).toBe(2)
  AWSMock.restore('DynamoDB.DocumentClient')
})
