import TravelBand from '@models/TravelBand'
import { IFolder } from '@models/Folder'
import { datastore } from '@datastore/index'
import { handleError } from '@helpers/http'
import HTTPError from '@errors/HTTPError'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import { validateFolder } from '@validators/folder'
import { v4 } from 'uuid'
import * as validateUUID from 'uuid-validate'

export const createFolder = async (event, context) => {
  let travelBand: TravelBand

  // validate travel band ID
  const travelBandId: string = event.pathParameters && event.pathParameters.travelBandId || ''
  if (!travelBandId || !validateUUID(travelBandId)) {
    return handleError(new BadRequestError(t('travelBands.errors.invalidUUID')))
  }

  const data = JSON.parse(event.body)
  const folder: IFolder = {
    folderId: v4(),
    name: data.name || '',
    description: data.description || undefined,
  }

  // validate user input for folder
  try {
    await validateFolder(folder)
  } catch (e) {
    return handleError(e as HTTPError)
  }

  try {
    // get travel band
    travelBand = await datastore.getTravelBand(travelBandId)

    if (travelBand.folders.find(f => f.name === folder.name)) {
      throw new BadRequestError(t('errors.folders.name.alreadyExists', { name: folder.name }))
    }
    // Create folder
    await datastore.createFolder(travelBand, folder)
  } catch (e) {
    return handleError(e as HTTPError)
  }

  return {
    statusCode: 201,
    body: JSON.stringify(folder),
  }
}
