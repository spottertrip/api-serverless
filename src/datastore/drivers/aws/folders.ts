import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { IFolder } from '@models/Folder'
import TravelBand from '@models/TravelBand'
import InternalServerError from '@errors/InternalServerError'
import { t } from '@helpers/i18n'
import BadRequestError from '@errors/BadRequestError';
import NotFoundError from '@errors/NotFoundError';

/**
 * Create a folder for a travel band
 * @param documentClient - Document Client to access DynamoDB
 * @param travelBand - Travel Band to create a folder for
 * @param folder - Folder to create
 */
export const createFolder = async (documentClient: DocumentClient, travelBand: TravelBand, folder: IFolder) => {
  const params = {
    TableName: 'travelBands',
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
    TableName: 'travelBands',
    AttributesToGet: ['folders'],
    Key: {
      travelBandId,
    },
  }
  const result = await documentClient.get(params).promise()
  if (!result.Item) {
    throw new NotFoundError(t('travelBands.errors.notFound'))
  }
  const travelBand = result.Item as TravelBand
  return travelBand.folders
}
