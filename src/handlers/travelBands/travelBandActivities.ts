import { APIGatewayProxyHandler } from 'aws-lambda'
import { datastore } from '@datastore/index'
import HTTPError from '@errors/HTTPError'
import { handleError } from '@helpers/http'
import Activity from '@models/Activity'

export const listTravelBandActivities: APIGatewayProxyHandler = async (event, context) => {
  let activities: Activity[]
  try {
    activities = await datastore.listTravelBandActivities(event.pathParameters.travelBandId)
  } catch (e) {
    return handleError(e as HTTPError)
  }
  return {
    statusCode: 200,
    body: JSON.stringify(activities),
  };
}
