import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import TravelBand from '@models/TravelBand'
import BadRequestError from '@errors/BadRequestError'
import NotFoundError from '@errors/NotFoundError'
import Activity from '@models/Activity';

export const getActivity = async(id: string): Promise<any> => {}
export const createActivities = async (activity: any): Promise<any>  => {}
export const listActivities = async (): Promise<any[]> => {
  return []
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
    throw new BadRequestError('travelBands.errors.missingId')
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
    throw new NotFoundError('Travel Band does not exist')
  }
  const travelBand = result.Item as TravelBand
  return travelBand.activities
}
