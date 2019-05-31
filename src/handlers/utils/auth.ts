import { datastore } from '@datastore/index'
import UnauthorizedError from '@errors/UnauthorizedError'
import DatabaseError from '@errors/DatabaseError'
import { t } from '@helpers/i18n'
import { APIGatewayProxyEvent } from 'aws-lambda'

/**
 * Check whether an event (HTTP Request) is authorized to act: Retrieve spotter ID from event, and check if spotter has
 * authorizations on given travel band id
 * @param event - API Gateway Lambda event
 * @param travelBandId - ID of the travel band for which a spotter wants to act upon
 */
export const isAuthorizedFromEvent = async (event: APIGatewayProxyEvent, travelBandId: string) => {
  // TODO: replace with event's request context when API Gateway custom authorizers are ready
  const spotterId = event.headers['X-Spotter']
  if (!spotterId) {
    throw new UnauthorizedError(t('errors.unauthorized'))
  }
  await isAuthorizedOnTravelBand(spotterId, travelBandId)
}

/**
 * Check whether a spotter is authorized to act upon a given travel band
 * @param spotterId - ID of the spotter
 * @param travelBandId - ID of the travel band
 * @throws DatabaseError
 * @throws UnauthorizedError
 */
export const isAuthorizedOnTravelBand = async (spotterId: string, travelBandId: string) => {
  let travelBands: string[] = []
  try {
    travelBands = await datastore.getTravelBandIdsForSpotter(spotterId)
    if (!travelBands.includes(travelBandId)) {
      throw new Error('unauthorized')
    }
  } catch (e) {
    throw new UnauthorizedError(t('errors.travelBands.unauthorized'))
  }
}
