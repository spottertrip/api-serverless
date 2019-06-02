import { handleError } from '@helpers/http'
import { datastore } from '@datastore/index'
import TravelBand from '@models/TravelBand'
import { getSpotterIdFromEvent } from '@handlers/utils/auth'

/**
 * Handler for event listing travel bands
 * @param event - API Gateway Event containing pathParameters: travelBandId used to retrieve travel bands
 * @param context
 */
export const listTravelBands = async (event, context) => {
  let travelBands: TravelBand[]
  let spotterId: string

  try {
    spotterId = await getSpotterIdFromEvent(event)
  } catch (e) {
    return handleError(e)
  }

  try {
    travelBands = await datastore.listTravelBandsForSpotter(spotterId)
  } catch (e) {
    return handleError(e)
  }
  return {
    statusCode: 200,
    body: JSON.stringify(travelBands),
  };
}
