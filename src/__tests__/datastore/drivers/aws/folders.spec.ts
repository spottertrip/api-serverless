jest.mock('aws-sdk')

import InternalServerError from '@errors/InternalServerError'
import { listSpotters } from '@datastore/drivers/aws/spotters'
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import { createFolder } from '@datastore/drivers/aws/folders'
import { IFolder } from '@models/Folder';
import TravelBand from '../../../../models/TravelBand'

AWSMock.setSDKInstance(AWS)

const fixtureTravelBand: TravelBand = {
  travelBandId: v4(),
  name: 'test',
  description: 'test',
  activities: [],
  spotters: [],
  folders: [],
  bookings: [],
}
const fixtureFolder: IFolder = {
  name: 'test',
  description: 'test',
  folderId: v4(),
}

test('create folder database error', async () => {
  const mockedUpdate = jest.fn((params: any, cb: any) => {
    throw new Error('database error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'update', mockedUpdate)
  await expect(createFolder(new AWS.DynamoDB.DocumentClient(), fixtureTravelBand, fixtureFolder)).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('create folder properly', async () => {
  const mockedUpdate = jest.fn((params: any, cb: any) => {
    return cb(null, {})
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'update', mockedUpdate)
  const folder = await createFolder(new AWS.DynamoDB.DocumentClient(), fixtureTravelBand, fixtureFolder)
  expect(folder.name).toBe(fixtureFolder.name)
  expect(folder.description).toBe(fixtureFolder.description)
  AWSMock.restore('DynamoDB.DocumentClient')
})
