import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import TravelBand from '@models/TravelBand'
import BadRequestError from '@errors/BadRequestError'
import NotFoundError from '@errors/NotFoundError'
import Activity from '@models/Activity'
import { t } from '@helpers/i18n'
import InternalServerError from '@errors/InternalServerError';
import { ListActivityOutput } from '@datastore/types';

export const getActivity = async(id: string): Promise<any> => {}
export const createActivities = async (activity: any): Promise<any>  => {}
/**
 * Retrieve paginated list of activities
 * @param documentClient - AWS DynamoDB Document Client to retrieve activities
 * @param {string} lastEvaluatedId - ID of last activity found for pagination
 * @param {number} itemsPerPage - number of activities to retrieve per page
 * @returns Activity[] - list of activities
 */
export const listActivities = async (
  documentClient: DocumentClient,
  lastEvaluatedId: string = '',
  itemsPerPage: number = 20): Promise<ListActivityOutput> => {
  const params: DocumentClient.ScanInput = {
    TableName: 'activities',
    Limit: itemsPerPage,
  }
  if (lastEvaluatedId) {
    params.ExclusiveStartKey = {
      activityId: lastEvaluatedId,
    }
  }

  let results: DocumentClient.ScanOutput
  try  {
    results = await documentClient.scan(params).promise()
  } catch (e) {
    console.log(e)
    throw new InternalServerError(t('errors.database.internal'))
  }

  // get Last Evaluated ID for futur pagination
  const retrieveLastEvaluatedId = results.LastEvaluatedKey && results.LastEvaluatedKey.activityId
    ? results.LastEvaluatedKey.activityId
    : ''

  return {
    lastEvaluatedId: retrieveLastEvaluatedId,
    activities: results.Items as Activity[],
  }
}
export const deleteActivity = async (id: string): Promise<void> => {}
export const updateActivity = async (): Promise<any> => {}

/**
 * List all activities shared inside a travel band
 * @param documentClient - AWS Document Client to access DynamoDB
 * @param travelBandId - ID of the travel band to get activities for
 * @throws NotFoundError - Travel Band does not exist with given ID
 * @throws BadRequestError - travel id is empty
 */
export const listTravelBandActivities = async (documentClient: DocumentClient, travelBandId: string): Promise<Activity[]> => {
  if (!travelBandId) {
    throw new BadRequestError(t('travelBands.errors.missingId'))
  }
  const params = {
    TableName: 'travelBands',
    AttributesToGet: ['activities'],
    Key: {
      travelBandId,
    },
  }
  const result = await documentClient.get(params).promise()
  if (!result.Item) {
    throw new NotFoundError(t('travelBands.errors.notFound'))
  }
  const travelBand = result.Item as TravelBand
  return travelBand.activities
}

/**
 * Retrieve a list of bookings made inside a travel band (both upcoming and already complete activities)
 * @param documentClient - AWS Document Client to retrieve data from DynamoDB
 * @param travelBandId - ID of the travel band to retrieve booked activities for
 */
export const listTravelBandBookings = async (documentClient: DocumentClient, travelBandId: string): Promise<Activity[]> => {
  if (!travelBandId) {
    throw new BadRequestError(t('travelBands.errors.missingId'))
  }
  const params = {
    TableName: 'travelBands',
    AttributesToGet: ['bookings'],
    Key: {
      travelBandId,
    },
  }
  const result = await documentClient.get(params).promise()
  if (!result.Item) {
    throw new NotFoundError(t('travelBands.errors.notFound'))
  }
  const travelBand = result.Item as TravelBand
  return travelBand.bookings
}
