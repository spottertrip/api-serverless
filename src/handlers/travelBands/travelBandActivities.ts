import { datastore } from '@datastore/index'
import HTTPError from '@errors/HTTPError'
import { handleError } from '@helpers/http'
import Activity from '@models/Activity'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import * as validateUUID from 'uuid-validate'

/**
 * Handler for event listing activities shared inside a travel band
 * @param event - API Gateway Event containing pathParameters: travelBandId used to retrieve travel band activities
 * @param context
 */
export const listTravelBandActivities = async (event, context) => {
  let activities: Activity[]
  const travelBandId: string = event.pathParameters && event.pathParameters.travelBandId || ''
  if (!travelBandId || !validateUUID(travelBandId)) {
    return handleError(new BadRequestError(t('travelBands.errors.invalidUUID')))
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

/**
 * List travel Band Activities booked for a given travel band
 * @param event - API Gateway Event, containing travel band id as path parameter
 * @param context
 */
export const listTravelBandBookings = async (event, context) => {
  let bookings: Activity[]

  const travelBandId: string = event.pathParameters && event.pathParameters.travelBandId || ''
  if (!travelBandId || !validateUUID(travelBandId)) {
    return handleError(new BadRequestError(t('travelBands.errors.invalidUUID')))
  }

  try {
    bookings = await datastore.listTravelBandBookings(event.pathParameters.travelBandId)
  } catch (e) {
    return handleError(e as HTTPError)
  }
  return {
    statusCode: 200,
    body: JSON.stringify(bookings),
  };
}
