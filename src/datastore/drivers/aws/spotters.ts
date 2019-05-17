import { DocumentClient, QueryOutput, GetItemOutput } from 'aws-sdk/clients/dynamodb'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import NotFoundError from '@errors/NotFoundError'
import TravelBand from '@models/TravelBand'
import ISpotter from '@models/Spotter'
import DatabaseError from '@errors/DatabaseError';

/**
 * List spotters inside given travel band
 * @param documentClient - AWS DynamoDB Document Client to access database
 * @param travelBandId - Travel Band UUID to retrieve spotters from
 * @throws BadRequestError - invalid travel Band UUID
 * @throws NotFoundError - travel band does not exist with given UUID
 */
export const listSpotters = async (documentClient: DocumentClient, travelBandId: string): Promise<ISpotter[]> => {
  if (!travelBandId || travelBandId === '') {
    throw new BadRequestError(t('travelBands.errors.missingId'))
  }
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDS,
    AttributesToGet: ['spotters'],
    Key: {
      travelBandId,
    },
  }
  const result = await documentClient.get(params).promise()
  if (!result.Item) {
    throw new NotFoundError(t('travelBands.errors.notFound'))
  }
  const travelBand = result.Item as TravelBand
  return travelBand.spotters
}

/**
 * Retrieve all travel band IDs for a given Spotter
 * @param documentClient DynamoDB document client
 * @param spotterId ID of the spotter for which we want to retrieve associated travel bands
 */
export const getTravelBandIdsForSpotter = async (documentClient: DocumentClient, spotterId: string): Promise<string[]> => {
  const params = {
    TableName: process.env.DB_TABLE_SPOTTERS,
    AttributesToGet: ['travelBands'],
    Key: {
      spotterId,
    },
  }

  let result: GetItemOutput
  try {
    result = await documentClient.get(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }

  if (!result.Item) {
    throw new NotFoundError(t('spotters.errors.notFound'));
  }

  const spotter = result.Item as ISpotter
  return spotter.travelBands
}

/**
 * Retrieve a spotter by given ID
 * @param documentClient - DynamoDB Document Client
 * @param spotterId - ID of the spotter to retrieve
 */
export const getSpotter = async (documentClient: DocumentClient, spotterId: string) => {
  const params = {
    TableName: process.env.DB_TABLE_SPOTTERS,
    Key: {
      spotterId,
    },
  };

  let result: GetItemOutput
  try {
    result = await documentClient.get(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }

  if (!result.Item) {
    throw new NotFoundError(t('spotters.errors.notFound'));
  }

  return result.Item as ISpotter
}
