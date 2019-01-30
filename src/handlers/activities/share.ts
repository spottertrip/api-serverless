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

type ShareActivityRequest = {
  travelBandId: string,
  folderId?: string,
}

/**
 * Share an activity to a travel band/folder
 * @param event - Serverless Event
 * @param context - Event Context
 */
export const shareActivity = async (event, context) => {
  let activity: Activity
  let travelBand: TravelBand
  let activityId: string

  try {
    activityId = getIdFromPath('activityId', event.pathParameters)
  } catch (e) {
    return handleError(new BadRequestError(t('errors.activities.invalidUUID')))
  }

  // Retrieve travel band + folders
  const data: ShareActivityRequest = JSON.parse(event.body)
  if (!data.travelBandId) {
    return handleError(new BadRequestError(t('')))
  }
  try {
    travelBand = await datastore.getTravelBand(data.travelBandId)
  } catch (e) {
    return handleError(e)
  }

  let folderId: string
  if (!data.folderId) { // if no folder provided, find default one for travel band
    const defaultFolder = travelBand.folders.find(folder => folder.isDefault)
    if (!defaultFolder || !defaultFolder.folderId) {
      return handleError(new InternalServerError(t('errors.folders.noDefaultFolder')))
    }
    folderId = defaultFolder.folderId
  } else if (data.folderId && (!validateUUID(data.folderId))) { // if provided, check that is valid UUID
    return handleError(new InvalidUUIDError('folderId').getErrorMessage())
  } else {
    folderId = data.folderId
  }

  // check that folder exists
  const folderExists = travelBand.folders.find(f => f.folderId === folderId)
  if (!folderExists) {
    return handleError(new NotFoundError(t('errors.folders.notFound')))
  }

  // Check that activity has not already been shared to folder
  try {
    const activityExistsInFolder = await datastore.activityExistsInFolder(activityId, travelBand.travelBandId, folderId)
    if (activityExistsInFolder) {
      throw new BadRequestError(t('errors.activities.existsInFolder'))
    }
  } catch (e) {
    return handleError(e)
  }

  try {
    activity = await datastore.shareActivity(activityId, data.travelBandId, folderId)
  } catch (e) {
    return handleError(e)
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      activity,
      shared: true,
    }),
  }
}
