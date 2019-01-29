import Activity from '@models/Activity'
import { getIdFromPath } from '@helpers/event'
import { handleError } from '@helpers/http'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import { datastore } from '@datastore/index'
import { IAvailability } from '@models/Availability'

/**
 * View details about an activity
 * @param event - Serverless Event
 * @param context - Event Context
 */
export const viewActivity = async (event, context) => {
  let activity: Activity
  let availabilities: IAvailability[]
  let activityId: string

  try {
    activityId = getIdFromPath('activityId', event.pathParameters)
  } catch (e) {
    return handleError(new BadRequestError(t('errors.activities.invalidUUID')))
  }

  try {
    activity = await datastore.getActivity(activityId)
  } catch (e) {
    return handleError(e)
  }

  try {
    availabilities = await datastore.listAvailabilities(activityId)
  } catch (e) {
    return handleError(e)
  }

  activity.availabilities = availabilities
  return {
    statusCode: 200,
    body: JSON.stringify(activity),
  }
}
