import { datastore } from '@datastore/index'
import HTTPError from '@errors/HTTPError'
import { handleError } from '@helpers/http'
import Activity from '@models/Activity'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'

/**
 * Handler for event listing activities shared inside a travel band
 * @param event - API Gateway Event containing pathParameters: travelBandId used to retrieve travel band activities
 * @param context
 */
export const listTravelBandActivities = async (event, context) => {
  let activities: Activity[]
  if (!event || !event.pathParameters || !event.pathParameters.travelBandId) {
    return handleError(new BadRequestError(t('travelBands.errors.missingId')))
  }
  try {
    activities = await datastore.listTravelBandActivities(event.pathParameters.travelBandId)
  } catch (e) {
    return handleError(e as HTTPError)
  }
  return {
    statusCode: 200,
    body: JSON.stringify(activities),
  };
}
