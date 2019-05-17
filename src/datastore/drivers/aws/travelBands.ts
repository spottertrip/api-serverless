import { DocumentClient, GetItemOutput } from 'aws-sdk/clients/dynamodb'
import NotFoundError from '@errors/NotFoundError'
import { t } from '@helpers/i18n'
import TravelBand from '@models/TravelBand'
import DatabaseError from '@errors/DatabaseError'

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
 * Create a Travel Band
 * @param documentClient AWS DynamoDB Document Client
 * @param travelBand - Travel Band to create
 */
export const createTravelBand = async (documentClient: DocumentClient, travelBand: TravelBand) => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDS,
    Item: travelBand,
  }

  try {
    await documentClient.put(params).promise()
    return travelBand
  } catch (e) {
    throw new DatabaseError(e.message)
  }
}
