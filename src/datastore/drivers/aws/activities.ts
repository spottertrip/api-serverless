import { DocumentClient, GetItemOutput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import TravelBand from '@models/TravelBand'
import BadRequestError from '@errors/BadRequestError'
import NotFoundError from '@errors/NotFoundError'
import Activity from '@models/Activity'
import { t } from '@helpers/i18n'
import { ListActivityOutput } from '@datastore/types'
import DatabaseError from '@errors/DatabaseError'
import { v4 } from 'uuid'

/**
 * Get an activity from given ID
 * @param {DocumentClient} documentClient - AWS DynamoDB DocumentClient to access database
 * @param {string} activityId - ID of the activity to retrieve
 */
export const getActivity = async(documentClient: DocumentClient, activityId: string): Promise<Activity> => {
  const params = {
    TableName: process.env.DB_TABLE_ACTIVITIES,
    Key: {
      activityId,
    },
  }

  // TODO: ADD OPTIONAL PARAMETER ATTRIBUTES TO RETRIEVE

  let result: GetItemOutput
  try {
    result = await documentClient.get(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }

  if (!result.Item) {
    throw new NotFoundError(t('errors.activities.notFound'))
  }

  return result.Item as Activity
}

export const createActivities = async (activity: any): Promise<any>  => {}
/**
 * Retrieve paginated list of activities
 * @param documentClient - AWS DynamoDB Document Client to retrieve activities
 * @param {string} lastEvaluatedId - ID of last activity found for pagination
 * @param {number} itemsPerPage - number of activities to retrieve per page
 * @returns Activity[] - list of activities
 * @throws DatabaseError - Internal error in database
 */
export const listActivities = async (
  documentClient: DocumentClient,
  lastEvaluatedId: string = '',
  itemsPerPage: number = 20): Promise<ListActivityOutput> => {
  const params: DocumentClient.ScanInput = {
    TableName: process.env.DB_TABLE_ACTIVITIES,
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
    throw new DatabaseError(e)
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
 * @throws DatabaseError - Internal error in database
 */
export const listTravelBandActivities = async (documentClient: DocumentClient, travelBandId: string): Promise<Activity[]> => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDACTIVITIES,
    KeyConditionExpression: 'travelBandId = :id',
    ExpressionAttributeValues: {
      ':id': travelBandId,
    },
  }

  try {
    const result = await documentClient.query(params).promise()
    return result.Items as Activity[]
  } catch (e) {
    throw new DatabaseError(e)
  }
}

/**
 * Check whether an activity exists in a given folder -> Travel band activities
 * @param documentClient - AWS DynamoDB documentclient
 * @param activityId - activity id to check
 * @param travelBandId - id of travel band
 * @param folderId - folder id to check
 * @return boolean - whether activty exists or not in folder
 * @throws DatabaseError
 */
export const activityExistsInFolder = async (documentClient: DocumentClient, activityId: string, travelBandId: string, folderId: string) => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDACTIVITIES,
    KeyConditionExpression: 'travelBandId = :travelBandId',
    FilterExpression: 'folderId = :folderId AND activityId = :activityId',
    ExpressionAttributeValues: {
      ':travelBandId': travelBandId,
      ':folderId': folderId,
      ':activityId': activityId,
    },
    Select: 'COUNT',
  }

  let result: QueryOutput
  try {
    result = await documentClient.query(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }

  return result.Count !== 0
}

/**
 * Share an activity to a travel band inside (or not) a folder
 * @param {DocumentClient} documentClient - AWS DynamoDB Document client to access database
 * @param {string} activityId - Activity ID to share
 * @param {string} travelBandId - Travel Band ID in which activity will be shared
 * @param {string} folderId - Folder ID in which activity will be shared
 * @returns Activity - Activity shared inside travel band/folder
 * @throws DatabaseError - Internal Error in Database
 */
export const shareActivity = async (documentClient: DocumentClient, activityId: string, travelBandId: string, folderId: string) => {
  // retrieve activity to share it inside travel band folder
  const activity = await getActivity(documentClient, activityId)
  const { name, pictures, price, mark, nbVotes, location } = activity
  const sharedActivity = {
    activityId,
    travelBandId,
    folderId,
    name,
    pictures,
    price,
    mark,
    nbVotes,
    location,
    id: v4(),
  }

  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDACTIVITIES,
    Item: sharedActivity,
  }

  try {
    await documentClient.put(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }

  return activity
}
