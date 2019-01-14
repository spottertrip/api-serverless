import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import NotFoundError from '@errors/NotFoundError'
import TravelBand from '@models/TravelBand'
import ISpotter from '@models/Spotter'

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
    TableName: 'travelBands',
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
