jest.mock('aws-sdk')

import InternalServerError from '@errors/InternalServerError'
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import {
  createFolder, getCountActivitiesInFolder,
  getFolder,
  listActivitiesInFolder,
  listFolders,
} from '@datastore/drivers/aws/folders'
import { IFolder } from '@models/Folder'
import TravelBand from '@models/TravelBand'
import NotFoundError from '@errors/NotFoundError'

AWSMock.setSDKInstance(AWS)

const fixtureTravelBand: TravelBand = {
  travelBandId: v4(),
  name: 'test',
  description: 'test',
  activities: [],
  spotters: [],
  folders: [],
  bookings: [],
  thumbnailUrl: 'https://activeforlife.com/content/uploads/2015/06/boy-girl-beach-ball.jpg',
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
  AWSMock.restore('DynamoDB.DocumentClient')
})

// ---- Get Folder ---- //

test('get folder with not existing travel band -> not found', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: null })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(getFolder(new AWS.DynamoDB.DocumentClient(), v4(), v4())).rejects.toThrow(NotFoundError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('folder not found in existing travel band', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: { folders: [{ folderId: v4() }] } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(getFolder(new AWS.DynamoDB.DocumentClient(), v4(), v4())).rejects.toThrow(NotFoundError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('database error', async () => {
  const mockedGet = jest.fn((params: any, cb:any) => {
    throw new Error('database error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(getFolder(new AWS.DynamoDB.DocumentClient(), v4(), v4())).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('get folder valid', async () => {
  const testFolder = {
    name: 'testing folder',
    description: 'description folder',
    folderId: v4(),
  }
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: { folders: [testFolder] } })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  const folder = await getFolder(new AWS.DynamoDB.DocumentClient(), v4(), testFolder.folderId)
  expect(folder.folderId).toBe(testFolder.folderId)
  AWSMock.restore('DynamoDB.DocumentClient')
})

// ---- List Activities in Folder ---- //

test('list activities in folder - database error', async () => {
  const mockedQuery = jest.fn((params: any, cb:any) => {
    throw new Error('database error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedQuery)
  await expect(listActivitiesInFolder(new AWS.DynamoDB.DocumentClient(), v4(), v4())).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('list activities in folder valid', async () => {
  const travelBandId = v4()
  const folderId = v4()
  const activities = [
    { folderId, travelBandId, activityId: v4() },
    { folderId, travelBandId, activityId: v4() },
  ]
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(null, { Items: activities  })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedQuery)
  const gotActivities = await listActivitiesInFolder(new AWS.DynamoDB.DocumentClient(), travelBandId, folderId)
  expect(gotActivities.length).toBe(2)
  AWSMock.restore('DynamoDB.DocumentClient')
})

// ---- Get Count Activities In Folder ---- //

const folderId = v4()
const travelBandId = v4()

test('get count activities - db error', async () => {
  const mockedQuery = jest.fn((params: any, cb: any) => {
    throw new Error('database error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedQuery)
  expect(getCountActivitiesInFolder(new AWS.DynamoDB.DocumentClient(), travelBandId, folderId)).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('get count activities', async () => {
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(null, { Count: 10 })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedQuery)
  const nbActivities = await getCountActivitiesInFolder(new AWS.DynamoDB.DocumentClient(), travelBandId, folderId)
  expect(nbActivities).toBe(10)
})
