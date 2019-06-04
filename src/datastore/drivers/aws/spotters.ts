import { DocumentClient, QueryOutput, GetItemOutput, ScanOutput } from 'aws-sdk/clients/dynamodb'
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
    throw new NotFoundError(t('errors.spotters.notFound'));
  }

  return result.Item as ISpotter
}

/**
 * Search a list of spotters based on given query
 * @param documentClient - AWS DYnamoDB DOcument Client
 * @param query - Query: either username or email of the spotter to retrieve
 */
export const searchSpotters = async (documentClient: DocumentClient, query: string) => {
  const params = {
    TableName: process.env.DB_TABLE_SPOTTERS,
    FilterExpression: 'contains(username, :username) OR contains(email, :email)',
    ExpressionAttributeValues: {
      ':username': query,
      ':email': query,
    },
  }

  let result: ScanOutput
  try {
    result = await documentClient.scan(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }

  return result.Items as ISpotter[]
}

/**
 * Invite a Spotter to a travel band - Update both travel band document to add spotter, and spotter document to add
 * travel band ID
 * @param documentClient - AWS DynamoDB document Client
 * @param spotterId - ID of the spotter to invite to travel band
 * @param travelBandId - ID of the travel band in which to invite given spotter
 * @throws DatabaseError
 * @throws NotFoundError
 */
export const inviteSpotterToTravelBand = async (documentClient: DocumentClient, spotterId: string, travelBandId: string) => {
  const spotter = await getSpotter(documentClient, spotterId)
  if (spotter.travelBands && spotter.travelBands.includes(travelBandId)) {
    throw new BadRequestError(t('errors.spotters.alreadyInTravelBand'))
  }

  const updateSpotterParams = {
    TableName: process.env.DB_TABLE_SPOTTERS,
    Key: { spotterId },
    UpdateExpression: 'set #travelBands = list_append(if_not_exists(#travelBands, :empty_list), :travelBand)',
    ExpressionAttributeNames: {
      '#travelBands': 'travelBands',
    },
    ExpressionAttributeValues: {
      ':travelBand': [travelBandId],
      ':empty_list': [],
    },
  }

  const travelBandSpotter = {
    username: spotter.username,
    email: spotter.email,
    thumbnailUrl: spotter.thumbnailUrl,
    spotterId: spotter.spotterId,
  }
  const updateTravelBandParams = {
    TableName: process.env.DB_TABLE_TRAVELBANDS,
    Key: { travelBandId },
    UpdateExpression: 'set #spotters = list_append(if_not_exists(#spotters, :empty_list), :spotter)',
    ExpressionAttributeNames: {
      '#spotters': 'spotters',
    },
    ExpressionAttributeValues: {
      ':spotter': [travelBandSpotter],
      ':empty_list': [],
    },
  }

  const transactionParams = {
    TransactItems: [
      {
        Update: updateSpotterParams,
      },
      {
        Update: updateTravelBandParams,
      },
    ],
  }

  try {
    await documentClient.transactWrite(transactionParams).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }

  return {
    ...spotter,
    travelBands: [...spotter.travelBands, travelBandId],
  } as ISpotter
}
