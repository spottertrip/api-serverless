import { createFolder } from '@handlers/folders'
import NotFoundError from '@errors/NotFoundError'
import { IFolder } from '@models/Folder'
import ValidationError from '@errors/ValidationError';
import { v4 } from 'uuid'

// Mock Datastore
jest.mock('@datastore/index', () => ({
  datastore: {
    getTravelBand: jest.fn((travelBandId: string) => {}),
    createFolder: jest.fn((travelBandId: string, folder: IFolder) => {}),
  },
}))
// Mock Validators
jest.mock('@validators/folder', () => ({
  validateFolder: jest.fn((folder: IFolder) => null),
}))

const validatorsMock = require('@validators/folder')
const datastoreMock = require('@datastore/index')

test('list travel band activities without ID returns bad request', async () => {
  const response = await createFolder({ pathParameters: {} }, {})
  expect(response.statusCode).toBe(400)
})

test('create folder for a travel band with not existing ID -> not found', async () => {
  datastoreMock.datastore.getTravelBand.mockRejectedValueOnce(new NotFoundError('does not exist'))
  const event = { pathParameters: { travelBandId: v4() }, body: JSON.stringify({}) }
  const response = await createFolder(event, {})
  expect(response.statusCode).toBe(404)
})

test('create folder with validation error', async () => {
  const error = 'validation error'
  const validationErrors = ['name too short', 'test']
  validatorsMock.validateFolder.mockRejectedValueOnce(new ValidationError(error, validationErrors))
  const event = { pathParameters: { travelBandId: v4() }, body: JSON.stringify({}) }
  const response = await createFolder(event, {})
  expect(response.statusCode).toBe(400)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.message).toBe(error)
  expect(responseBody.errors.length).toBe(validationErrors.length)
})

test('create folder with name already exists', async () => {
  const data = { name: 'exists' }
  const mockedData = { folders: [{ name: 'exists' }] }
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(mockedData)
  const event = { pathParameters: { travelBandId: v4() }, body: JSON.stringify(data) }
  const response = await createFolder(event, {})
  expect(response.statusCode).toBe(400)
})

test('create folder properly', async () => {
  const travelBandId = v4()
  const folder: IFolder = {
    name: 'valid name',
    description: 'valid description',
    folderId: v4(),
  }
  const data = { name: folder.name, description: folder.description }
  const responseData = { travelBandId, name: folder.name, description: folder.description }
  const mockedData = { folders: [] }
  datastoreMock.datastore.getTravelBand.mockResolvedValueOnce(mockedData)
  datastoreMock.datastore.createFolder.mockResolvedValueOnce(responseData)
  const event = { pathParameters: { travelBandId }, body: JSON.stringify(data) }
  const response = await createFolder(event, {})
  expect(response.statusCode).toBe(201)
  const responseBody = JSON.parse(response.body)
  expect(responseBody.name).toBe(folder.name)
  expect(responseBody.description).toBe(folder.description)
})
