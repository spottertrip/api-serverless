import { handleError } from '@helpers/http'
import { datastore } from '@datastore/index'
import HTTPError from '@errors/HTTPError'
import TravelBand from '@models/TravelBand'

/**
 * Handler for event listing travel bands
 * @param event - API Gateway Event containing pathParameters: travelBandId used to retrieve travel bands
 * @param context
 */
export const listTravelBands = async (event, context) => {
  let travelBands: TravelBand[]

  try {
    travelBands = await datastore.listTravelBands()
  } catch (e) {
    return handleError(e as HTTPError)
  }
  return {
    statusCode: 200,
    body: JSON.stringify(travelBands),
  };
}
