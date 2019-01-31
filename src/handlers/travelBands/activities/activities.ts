import { datastore } from '@datastore/index'
import HTTPError from '@errors/HTTPError'
import { handleError } from '@helpers/http'
import Activity from '@models/Activity'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import TravelBand from '@models/TravelBand'
import { getIdFromPath } from '@helpers/event'

/**
 * Handler for event listing activities shared inside a travel band
 * @param event - API Gateway Event containing pathParameters: travelBandId used to retrieve travel band activities
 * @param context
 */
export const listTravelBandActivities = async (event, context) => {
  let activities: Activity[]
  let travelBand: TravelBand
  let travelBandId: string

  try {
    travelBandId = getIdFromPath('travelBandId', event.pathParameters)
  } catch (e) {
    return handleError(new BadRequestError(t('travelBands.errors.invalidUUID')))
  }

  // get Travel Band
  // TODO: remove when authentication will be in place as Travel Band will be fetched during auth to verify permissions for user
  // on given travel band
  try {
    travelBand = await datastore.getTravelBand(travelBandId)
  } catch (e) {
    return handleError(e)
  }

  try {
    activities = await datastore.listTravelBandActivities(travelBand.travelBandId)
  } catch (e) {
    return handleError(e as HTTPError)
  }
  return {
    statusCode: 200,
    body: JSON.stringify(activities),
  };
}
