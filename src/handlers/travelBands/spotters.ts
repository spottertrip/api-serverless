import { handleError } from '@helpers/http'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import { datastore } from '@datastore/index'
import HTTPError from '@errors/HTTPError'
import ISpotter from '@models/Spotter'
import TravelBand from '@models/TravelBand'
import { getIdFromPath } from '@helpers/event'

/**
 * Handler for event listing spotters inside a travel band
 * @param event - API Gateway Event containing pathParameters: travelBandId used to retrieve travel band activities
 * @param context
 */
export const listTravelBandSpotters = async (event, context) => {
  let spotters: ISpotter[]
  let travelBand: TravelBand
  let travelBandId: string

  try {
    travelBandId = getIdFromPath('travelBandId', event.pathParameters)
  } catch (e) {
    return handleError(new BadRequestError(t('travelBands.errors.invalidUUID')))
  }

  // TODO: Remove when auth flow is ready as travel band will be fetched during auth to check permissions for user
  try {
    travelBand = await datastore.getTravelBand(travelBandId)
  } catch (e) {
    return handleError(e)
  }

  try {
    spotters = await datastore.listSpotters(travelBand.travelBandId)
  } catch (e) {
    return handleError(e as HTTPError)
  }
  return {
    statusCode: 200,
    body: JSON.stringify(spotters),
  };
}
