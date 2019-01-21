import { datastore } from '@datastore/index'
import { handleError } from '@helpers/http'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import { IAvailability } from '@models/Availability'
import HTTPError from '@errors/HTTPError'
import * as validateUUID from 'uuid-validate'

/**
 * Handler to list availabilities (opening) for a given availability
 * @param event - API Gateway event
 * @param context - Serverless context
 */
export const listAvailabilities = async (event, context) => {
  let availabilities: IAvailability[]
  const activityId: string = event.pathParameters && event.pathParameters.activityId || ''
  if (!activityId || !validateUUID(activityId)) {
    return handleError(new BadRequestError(t('errors.activities.invalidUUID')))
  }

  try {
    availabilities = await datastore.listAvailabilities(activityId)
  } catch (e) { // TODO: check errors when activity does not exist with given ID
    console.error(e)
    return handleError(e as HTTPError)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(availabilities),
  }
}
