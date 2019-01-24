import { validateFolder } from '@validators/folder'
import { IFolder } from '@models/Folder'
import ValidationError from '@errors/ValidationError'
import { v4 } from 'uuid'

test('invalid folder - name missing', async () => {
  const folder: IFolder = {
    folderId: v4(),
    name: '',
    description: '',
  }
  await expect(validateFolder(folder)).rejects.toThrow(ValidationError)
})

test('invalid folder - name too short', async () => {
  const folder: IFolder = {
    folderId: v4(),
    name: 'te',
    description: '',
  }
  await expect(validateFolder(folder)).rejects.toThrow(ValidationError)
})

test('invalid folder - name too long', async () => {
  const folder: IFolder = {
    folderId: v4(),
    name: 'invalid name, way too big as it is more than 20 characters',
    description: '',
  }
  await expect(validateFolder(folder)).rejects.toThrow(ValidationError)
})

test('invalid folder - description too long', async () => {
  const folder: IFolder = {
    folderId: v4(),
    name: 'valid name',
    description: 'description too long, limit is 120 characters, so users do not pollute their beautiful folders with too long descriptions',
  }
  await expect(validateFolder(folder)).rejects.toThrow(ValidationError)
})

test('valid folder - no description', async () => {
  const folder: IFolder = {
    folderId: v4(),
    name: 'test valid',
    description: '',
  }
  await validateFolder(folder)
})

test('valid folder - with description', async () => {
  const folder: IFolder = {
    folderId: v4(),
    name: 'test valid',
    description: 'Testing description for folder',
  }
  await validateFolder(folder)
})
