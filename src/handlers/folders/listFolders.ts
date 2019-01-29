import { IFolder } from '@models/Folder'
import { datastore } from '@datastore/index'
import { handleError } from '@helpers/http'
import HTTPError from '@errors/HTTPError'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import * as validateUUID from 'uuid-validate'

/**
 * List Activity Folders for a given Travel Band
 * @param event - Serverless event
 * @param context - Serverless context
 */
export const listFolders = async (event, context) => {
  let folders: IFolder[]

  // validate travel band ID
  const travelBandId: string = event.pathParameters && event.pathParameters.travelBandId || ''
  if (!travelBandId || !validateUUID(travelBandId)) {
    return handleError(new BadRequestError(t('travelBands.errors.invalidUUID')))
  }

  try {
    // get folders
    folders = await datastore.listFolders(travelBandId)
  } catch (e) {
    return handleError(e as HTTPError)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(folders),
  }
}
