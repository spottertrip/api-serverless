import { handleError } from '@helpers/http'
import { datastore } from '@datastore/index'
import { getIdFromPath } from '@helpers/event'
import { t } from '@helpers/i18n'
import BadRequestError from '@errors/BadRequestError'
import { isAuthorizedFromEvent } from '@handlers/utils/auth'
import { APIGatewayProxyEvent } from 'aws-lambda'
import ISpotter from '@models/Spotter'

type InviteSpotterRequest = {
  spotterId: string,
}

/**
 * Invite a Spotter to join a travel band (wishlist)
 * @param event - Serverless Event
 * @param context - Event Context
 */
export const inviteSpotter = async (event: APIGatewayProxyEvent) => {
  let travelBandId: string

  try {
    travelBandId = getIdFromPath('travelBandId', event.pathParameters)
  } catch (e) {
    return handleError(new BadRequestError(t('errors.activities.invalidUUID')))
  }

  // Retrieve Spotter ID to invite in travel band
  const data: InviteSpotterRequest = JSON.parse(event.body)
  if (!data.spotterId) {
    return handleError(new BadRequestError(t('errors.spotters.missingUUID')))
  }

  // Check authorizations
  try {
    await isAuthorizedFromEvent(event, travelBandId)
  } catch (e) {
    return handleError(e)
  }

  let spotter: ISpotter
  try {
    spotter = await datastore.inviteSpotterToTravelBand(data.spotterId, travelBandId)
  } catch (e) {
    return handleError(e)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(spotter),
  }
}
