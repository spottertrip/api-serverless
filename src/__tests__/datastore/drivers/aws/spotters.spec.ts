jest.mock('aws-sdk')

import { listSpotters } from '@datastore/drivers/aws/spotters'
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import BadRequestError from '@errors/BadRequestError'
import NotFoundError from '@errors/NotFoundError'

AWSMock.setSDKInstance(AWS)

test('list travel band spotters without ID returns bad request', async () => {
  await expect(listSpotters(new AWS.DynamoDB.DocumentClient(), '')).rejects.toThrow(BadRequestError)
})

test('list travel band spotters with not existing ID -> not found', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: null })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(listSpotters(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(NotFoundError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('list travel band spotters with valid ID', async () => {
  const testUsername = 'testUser'
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: { spotters: [{ username: testUsername }] } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  const spotters = await listSpotters(new AWS.DynamoDB.DocumentClient(), v4())
  expect(spotters.length).toBe(1)
  expect(spotters[0].username).toBe(testUsername)
})