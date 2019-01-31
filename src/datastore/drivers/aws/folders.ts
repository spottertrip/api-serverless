import { DocumentClient, GetItemOutput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { IFolder } from '@models/Folder'
import TravelBand from '@models/TravelBand'
import InternalServerError from '@errors/InternalServerError'
import { t } from '@helpers/i18n'
import NotFoundError from '@errors/NotFoundError'
import Activity from '@models/Activity'
import DatabaseError from '@errors/DatabaseError'

/**
 * Create a folder for a travel band
 * @param documentClient - Document Client to access DynamoDB
 * @param travelBand - Travel Band to create a folder for
 * @param folder - Folder to create
 */
export const createFolder = async (documentClient: DocumentClient, travelBand: TravelBand, folder: IFolder) => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDS,
    Key: {
      travelBandId: travelBand.travelBandId,
    },
    UpdateExpression: 'SET folders = :folders',
    ExpressionAttributeValues: {
      ':folders': [...travelBand.folders, folder],
    },
  }

  try {
    await documentClient.update(params).promise()
    return folder
  } catch (e) {
    throw new InternalServerError(t('errors.database.internal'))
  }
}

/**
 * Retrieve a List of folders for a given travel band from DynamoDB
 * @param documentClient - Document Client to access DynamoDB
 * @param travelBandId - Travel Band id to retrieve folders for
 */
export const listFolders = async (documentClient: DocumentClient, travelBandId: string): Promise<IFolder[]> => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDS,
    AttributesToGet: ['folders'],
    Key: {
      travelBandId,
    },
  }

  let result: GetItemOutput
  try {
    result = await documentClient.get(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }
  if (!result.Item) {
    throw new NotFoundError(t('travelBands.errors.notFound'))
  }
  const travelBand = result.Item as TravelBand
  return travelBand.folders
}

/**
 * Get a Folder from a travel band by travel band ID and Folder ID
 * @param documentClient - AWS DynamoDB document client
 * @param {string} travelBandId - travel band id
 * @param {string} folderId - folder id
 */
export const getFolder = async (documentClient: DocumentClient, travelBandId: string, folderId: string): Promise<IFolder> => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDS,
    AttributesToGet: ['folders'],
    Key: {
      travelBandId,
    },
  }

  let result: GetItemOutput
  try {
    result = await documentClient.get(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }
  if (!result.Item) {
    throw new NotFoundError(t('travelBands.errors.notFound'))
  }
  const travelBand = result.Item as TravelBand

  // get folder
  const folder = travelBand.folders.find(f => f.folderId === folderId)
  if (!folder) {
    throw new NotFoundError(t('errors.folders.notFound'))
  }
  return folder
}

/**
 * List activities for a given folder inside a given travel band
 * @param {DocumentClient} documentClient - DynamoDB DocumentClient - access to AWS DynamoDB
 * @param {string} travelBandId - ID of the travel band in which folders belong
 * @param {string} folderId - ID of the folder to retrieve activities for
 */
export const listActivitiesInFolder = async (documentClient: DocumentClient, travelBandId: string, folderId: string): Promise<Activity[]> => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDACTIVITIES,
    KeyConditionExpression: 'travelBandId = :travelBandId',
    FilterExpression: 'folderId = :folderId',
    ExpressionAttributeValues: {
      ':travelBandId': travelBandId,
      ':folderId': folderId,
    },
  }

  let result: QueryOutput
  try {
    result = await documentClient.query(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }
  return result.Items as Activity[]
}

export const getCountActivitiesInFolder = async (documentClient: DocumentClient, travelBandId: string, folderId: string) => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDACTIVITIES,
    KeyConditionExpression: 'travelBandId = :travelBandId',
    FilterExpression: 'folderId = :folderId',
    ExpressionAttributeValues: {
      ':travelBandId': travelBandId,
      ':folderId': folderId,
    },
    Select: 'COUNT',
  }

  let result: QueryOutput
  try {
    result = await documentClient.query(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }
  return result.Count
}
