import { handleError } from '@helpers/http'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import { datastore } from '@datastore/index'
import HTTPError from '@errors/HTTPError'
import ISpotter from '@models/Spotter'

/**
 * Handler for event listing spotters inside a travel band
 * @param event - API Gateway Event containing pathParameters: travelBandId used to retrieve travel band activities
 * @param context
 */
export const listTravelBandSpotters = async (event, context) => {
  let spotters: ISpotter[]
  if (!event || !event.pathParameters || !event.pathParameters.travelBandId) {
    return handleError(new BadRequestError(t('travelBands.errors.missingId')))
  }
  try {
    spotters = await datastore.listSpotters(event.pathParameters.travelBandId)
  } catch (e) {
    return handleError(e as HTTPError)
  }
  return {
    statusCode: 200,
    body: JSON.stringify(spotters),
  };
}
