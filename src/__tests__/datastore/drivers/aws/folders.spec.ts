jest.mock('aws-sdk')

import InternalServerError from '@errors/InternalServerError'
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import { createFolder, listFolders } from '@datastore/drivers/aws/folders'
import { IFolder } from '@models/Folder';
import TravelBand from '@models/TravelBand'
import NotFoundError from '@errors/NotFoundError';

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

// ---- LIST FOLDER ---- //

test('list travel band folders with not existing ID -> not found', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: null })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(listFolders(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(NotFoundError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('list travel band folders with valid ID', async () => {
  const testFolder = {
    name: 'testing folder',
    description: 'description folder',
    folderId: v4(),
  }
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: { folders: [testFolder] } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  const folders = await listFolders(new AWS.DynamoDB.DocumentClient(), v4())
  expect(folders.length).toBe(1)
  expect(folders[0].folderId).toBe(testFolder.folderId)
})
