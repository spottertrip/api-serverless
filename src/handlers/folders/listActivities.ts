import Activity from '@models/Activity'
import { datastore } from '@datastore/index'
import { handleError } from '@helpers/http'
import BadRequestError from '@errors/BadRequestError'
import { getIdFromPath } from '@helpers/event'
import { IFolder } from '@models/Folder'

/**
 * List activities in a given activity folder
 * @param event - Serverless Event
 * @param context - Event context
 */
export const listActivitiesInFolder = async (event, context) => {
  let activities: Activity[]
  let folder: IFolder
  let travelBandId: string
  let folderId: string
  // get travel band id and folder ID from path parameters and validate they are valid UUIDs
  try {
    travelBandId = getIdFromPath('travelBandId', event.pathParameters)
    folderId = getIdFromPath('folderId', event.pathParameters)
  } catch (e) {
    return handleError(new BadRequestError(e.getErrorMessage()))
  }

  // Retrieve folder
  try {
    folder = await datastore.getFolder(travelBandId, folderId)
  } catch (e) {
    return handleError(e)
  }

  // retrieve activities for folder
  try {
    activities = await datastore.listActivitiesInFolder(travelBandId, folder.folderId)
  } catch (e) {
    return handleError(e)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(activities),
  }
}
