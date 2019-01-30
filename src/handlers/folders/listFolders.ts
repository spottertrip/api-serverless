import { IFolder } from '@models/Folder'
import { datastore } from '@datastore/index'
import { handleError } from '@helpers/http'
import HTTPError from '@errors/HTTPError'
import BadRequestError from '@errors/BadRequestError'
import { getIdFromPath } from '@helpers/event';

/**
 * List Activity Folders for a given Travel Band
 * @param event - Serverless event
 * @param context - Serverless context
 */
export const listFolders = async (event, context) => {
  let folders: IFolder[]
  let travelBandId: string

  try {
    travelBandId = getIdFromPath('travelBandId', event.pathParameters)
  } catch (e) {
    return handleError(new BadRequestError(e.getErrorMessage()))
  }

  try {
    // get folders
    folders = await datastore.listFolders(travelBandId)
  } catch (e) {
    return handleError(e as HTTPError)
  }

  // get number of activities
  let foldersWithActivityCount: IFolder[]
  try {
    const foldersPromise = folders.map(async (folder: IFolder) => {
      const activityCount = await datastore.getCountActivitiesInFolder(travelBandId, folder.folderId)
      return {
        ...folder,
        nbActivities: activityCount,
      } as IFolder
    })
    foldersWithActivityCount = await Promise.all(foldersPromise)
  } catch (e) {
    return handleError(e)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(foldersWithActivityCount),
  }
}
