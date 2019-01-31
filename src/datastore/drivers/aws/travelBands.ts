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
