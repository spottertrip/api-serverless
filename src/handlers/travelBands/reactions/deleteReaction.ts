import { datastore } from '@datastore/index'
import { handleError } from '@helpers/http'
import HTTPError from '@errors/HTTPError'
import ISpotter from '@models/Spotter';
import BadRequestError from '@errors/BadRequestError';
import { t } from '@helpers/i18n';
import { getIdFromPath } from '@helpers/event';
import Activity from '@models/Activity';
import NotFoundError from '@errors/NotFoundError';
import { Reaction } from '@models/Reaction';
import UnauthorizedError from '@errors/UnauthorizedError';
import { getSpotterIdFromEvent } from '@handlers/utils/auth';

/**
 * Delete a reaction
 * @param event - AWS Event
 */
export const deleteReaction = async (event) => {
  let travelBandId: string
  let activityId: string
  let spotterId: string

  try {
    spotterId = await getSpotterIdFromEvent(event)
  } catch (e) {
    return handleError(e)
  }

  try {
    travelBandId = getIdFromPath('travelBandId', event.pathParameters)
  } catch (e) {
    return handleError(new BadRequestError(t('errors.travelBands.invalidUUID')))
  }

  try {
    activityId = getIdFromPath('activityId', event.pathParameters)
  } catch (e) {
    return handleError(new BadRequestError(t('errors.activities.invalidUUID')))
  }

  // Get Spotter who shared a reaction to the activity
  let spotter: ISpotter
  try {
    // TODO: remove when authentication is done
    spotter = await datastore.getSpotter(spotterId);
    if (!spotter.travelBands || !spotter.travelBands.includes(travelBandId)) {
      throw new UnauthorizedError(t('errors.travelBands.unauthorized'))
    }
  } catch (error) {
    return handleError(error as HTTPError)
  }

  // get activity
  let activity: Activity
  try {
    activity = await datastore.getTravelBandActivity(travelBandId, activityId)
  } catch (e) {
    return handleError(e)
  }

  if (!activity.reactions) {
    activity.reactions = []
  }
  const reaction = activity.reactions.find((reaction: Reaction) => reaction.spotterId === spotter.spotterId)
  if (!reaction) {
    return handleError(new NotFoundError(t('errors.reactions.notFound')))
  }
  // Clear reaction for given spotter
  activity.reactions = activity.reactions.filter((reaction: Reaction) => reaction.spotterId !== spotter.spotterId)

  try {
    await datastore.updateTravelBandActivity(activity)
  } catch (e) {
    return handleError(e as HTTPError)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(reaction),
  }
}
