import Activity from '@models/Activity'
import { handleError } from '@helpers/http'
import { datastore } from '@datastore/index'
import { getIdFromPath } from '@helpers/event'
import { t } from '@helpers/i18n'
import BadRequestError from '@errors/BadRequestError'
import TravelBand from '@models/TravelBand'
import * as validateUUID from 'uuid-validate'
import InvalidUUIDError from '@errors/InvalidUUIDError'
import InternalServerError from '@errors/InternalServerError'
import NotFoundError from '@errors/NotFoundError'
import ISpotter from '@models/Spotter';

type CheckAvailabilityRequest = {
  date: string,
}

/**
 * Send an email to an office to ask for the availability of an activity on a given date.
 * @param event - Serverless Event
 * @param context - Event Context
 */
export const checkAvailability = async (event, context) => {
  let activity: Activity
  let activityId: string

  try {
    activityId = getIdFromPath('activityId', event.pathParameters)
  } catch (e) {
    return handleError(new BadRequestError(t('errors.activities.invalidUUID')))
  }

  // Retrieve travel band + folders
  const data: CheckAvailabilityRequest = JSON.parse(event.body)
  const wantedDate = new Date(data && data.date || '')
  // CHeck if provided date is valid
  if (isNaN(wantedDate.getMonth())) {
    return handleError(new BadRequestError(t('errors.availabilities.invalidDate')))
  }

  // Get Spotter who shared a reaction to the activity
  const spotterId = '15a992e1-8d3f-421e-99a3-2ba5d2131d82'
  let spotter: ISpotter
  try {
    // TODO: remove when authentication is done
    spotter = await datastore.getSpotter(spotterId);
  } catch (error) {
    return handleError(error)
  }

  try {
    // get activity
    activity = await datastore.getActivity(activityId)
  } catch (e) {
    return handleError(e)
  }

  // send email

  return {
    statusCode: 200,
    body: JSON.stringify({
      activity,
      date: wantedDate,
    }),
  }
}
