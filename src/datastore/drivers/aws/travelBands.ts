import { DocumentClient, GetItemOutput } from 'aws-sdk/clients/dynamodb'
import NotFoundError from '@errors/NotFoundError'
import { t } from '@helpers/i18n'
import TravelBand from '@models/TravelBand'
import DatabaseError from '@errors/DatabaseError'
import { getTravelBandIdsForSpotter } from './spotters'

/**
 * Get travel band from given ID
 * @param documentClient - document client to access DynamoDB datastore
 * @param travelBandId - ID of the travel band to retrieve
 */
export const getTravelBand = async (documentClient: DocumentClient, travelBandId: string) => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDS,
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
  return result.Item as TravelBand
}

/**
 * List travel bands in which given user belongs
 * @param {DocumentClient} documentClient - AWS Document client to access DynamoDB
 * @returns {TravelBand[]} - list of travel bands
 */
export const listTravelBands = async (documentClient: DocumentClient) => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDS,
  }

  // TODO: Add query by userId when authentication is ready
  try {
    const result = await documentClient.scan(params).promise()
    return result.Items as TravelBand[]
  } catch (e) {
    throw new DatabaseError(e.message)
  }
}

/**
 * Get a list of travel bands for a given spotter ID
 * @param documentClient - AWS DynamoDB Document Client
 * @param spotterId - ID of the spotter to list travel bands for
 * @throws DatabaseError - Error happened in Datastore
 * @throws NotFoundError - Spotter does not exist
 */
export const listTravelBandsForSpotter = async (documentClient: DocumentClient, spotterId: string) => {
  const travelBandIds = await getTravelBandIdsForSpotter(documentClient, spotterId);
  if (!travelBandIds.length) return [];

  let filterExpression = ''
  const expressionAttributeValues = {};
  travelBandIds.forEach((travelBandId: string, index: number) => {
    // Create filter expression string by concatenating expressions
    if (filterExpression !== '') filterExpression += ','
    const filterName = `:travelBandId${index}`
    filterExpression += filterName
    expressionAttributeValues[filterName] = travelBandId
  })

  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDS,
    FilterExpression: `travelBandId IN (${filterExpression})`,
    ExpressionAttributeValues: expressionAttributeValues,
  }

  let result
  try {
    result = await documentClient.scan(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }
  return result.Items.map(
    (travelBand: TravelBand) => ({ ...travelBand, description: travelBand.description || '' }),
  ) as TravelBand[]
}

/**
 * Create a Travel Band
 * @param documentClient AWS DynamoDB Document Client
 * @param travelBand - Travel Band to create
 */
export const createTravelBand = async (documentClient: DocumentClient, travelBand: TravelBand) => {
  const createTravelBandParams = {
    TableName: process.env.DB_TABLE_TRAVELBANDS,
    Item: travelBand,
  }

  const updateSpotterParams = {
    TableName: process.env.DB_TABLE_SPOTTERS,
    Key: { spotterId: travelBand.spotters[0].spotterId },
    UpdateExpression: 'set #travelBands = list_append(if_not_exists(#travelBands, :empty_list), :travelBand)',
    ExpressionAttributeNames: {
      '#travelBands': 'travelBands',
    },
    ExpressionAttributeValues: {
      ':travelBand': [travelBand.travelBandId],
      ':empty_list': [],
    },
  }

  const transactionParams = {
    TransactItems: [
      {
        Put: createTravelBandParams,
      },
      {
        Update: updateSpotterParams,
      },
    ],
  }

  try {
    await documentClient.transactWrite(transactionParams).promise()
    return travelBand
  } catch (e) {
    throw new DatabaseError(e.message)
  }
}
