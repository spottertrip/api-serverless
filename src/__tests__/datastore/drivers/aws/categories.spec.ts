jest.mock('aws-sdk')

import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import { listCategories } from '@datastore/drivers/aws/categories';
import DatabaseError from '@errors/DatabaseError';

AWSMock.setSDKInstance(AWS)

test('list categories return unknown error', async () => {
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(new Error('database error'), null)
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', mockedQuery)
  await expect(listCategories(new AWS.DynamoDB.DocumentClient())).rejects.toThrow(DatabaseError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('list categories valid', async () => {
  const data = [
    {
      categoryId: v4(),
      name: 'sport',
    },
    {
      categoryId: v4(),
      name: 'culture',
    },
  ]
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(null, { Items: data })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', mockedQuery)
  const categories = await listCategories(new AWS.DynamoDB.DocumentClient())
  expect(categories.length).toBe(2)
})
