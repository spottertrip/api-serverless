import { DocumentClient, GetItemOutput, QueryOutput, PutItemOutput } from 'aws-sdk/clients/dynamodb'
import NotFoundError from '@errors/NotFoundError'
import Activity from '@models/Activity'
import { t } from '@helpers/i18n'
import { ListActivityOutput, FilterActivitiesOptions } from '@datastore/types'
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
export const listActivities = async (documentClient: DocumentClient, options: FilterActivitiesOptions): Promise<ListActivityOutput> => {
  const params: DocumentClient.ScanInput = {
    TableName: process.env.DB_TABLE_ACTIVITIES,
    Limit: options.itemsPerPage,
  }
  if (options.lastEvaluatedId) {
    params.ExclusiveStartKey = {
      activityId: options.lastEvaluatedId,
    }
  }

  const filterExpression: string[] = []
  const expressionAttributeValues = {}
  const expressionAttributeNames = {}
  if (options.category) {
    filterExpression.push('category.categoryId = :categoryId')
    expressionAttributeValues[':categoryId'] = options.category
  }
  if (options.priceMax) {
    filterExpression.push('price < :priceMax')
    expressionAttributeValues[':priceMax'] = options.priceMax
  }
  if (options.priceMin) {
    filterExpression.push('price > :priceMin')
    expressionAttributeValues[':priceMin'] = options.priceMin
  }
  if (options.q) {
    let expression = '(contains(#city, :query) OR contains(#street, :query) OR contains(#country, :query) '
    expression += 'OR contains(#name, :query) OR contains(#description, :query) OR contains(#office, :query))'
    filterExpression.push(expression)
    expressionAttributeNames['#city'] = 'location.city'
    expressionAttributeNames['#street'] = 'location.street'
    expressionAttributeNames['#country'] = 'location.country'
    expressionAttributeNames['#name'] = 'name'
    expressionAttributeNames['#description'] = 'description'
    expressionAttributeNames['#office'] = 'office.name'
    expressionAttributeValues[':query'] = options.q
  }

  if (Object.keys(expressionAttributeValues).length > 0) {
    params.FilterExpression = filterExpression.join(' AND ')
    params.ExpressionAttributeValues = expressionAttributeValues
    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames
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
    reactions: [],
  }

  const addActivityParams = {
    TableName: process.env.DB_TABLE_TRAVELBANDACTIVITIES,
    Item: sharedActivity,
  }

  const updateCountTravelBandParams = {
    TableName: process.env.DB_TABLE_TRAVELBANDS,
    Key: { travelBandId },
    UpdateExpression: 'add activityCount :count',
    ExpressionAttributeValues: {
      ':count': 1,
    },
  }

  const transactionParams = {
    TransactItems: [
      {
        Put: addActivityParams,
      },
      {
        Update: updateCountTravelBandParams,
      },
    ],
  }

  try {
    await documentClient.transactWrite(transactionParams).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }

  return true
}

/**
 * Get an activity shared to a travel band from a given ID
 * @param {DocumentClient} documentClient - AWS DynamoDB DocumentClient to access database
 * @param {string} activityId - ID of the activity to retrieve
 */
export const getTravelBandActivity = async(documentClient: DocumentClient, travelBandId: string, activityId: string): Promise<Activity> => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDACTIVITIES,
    KeyConditionExpression: 'travelBandId = :travelBandId',
    FilterExpression: 'activityId = :activityId',
    ExpressionAttributeValues: {
      ':travelBandId': travelBandId,
      ':activityId': activityId,
    },
  }

  let result: QueryOutput
  try {
    result = await documentClient.query(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }

  if (!result.Items.length) {
    throw new NotFoundError(t('errors.activities.notFound'))
  }

  return result.Items[0] as Activity
}

/**
 * Update an activity shared to a travel band
 * @param {DocumentClient} documentClient - AWS DynamoDB DocumentClient to access database
 * @param {Activity} activity - Activity to update
 */
export const updateTravelBandActivity = async(documentClient: DocumentClient, activity: Activity): Promise<void> => {
  const params = {
    TableName: process.env.DB_TABLE_TRAVELBANDACTIVITIES,
    Item: activity,
  }

  try {
    await documentClient.put(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }
}

/**
 * List all activities shared inside a travel band
 * @param documentClient - AWS Document Client to access DynamoDB
 * @param travelBandId - ID of the travel band to get activities for
 * @throws DatabaseError - Internal error in database
 */
export const listHighlightedActivities = async (documentClient: DocumentClient): Promise<Activity[]> => {
  const params = {
    TableName: process.env.DB_TABLE_ACTIVITIES,
    FilterExpression: 'highlighted = :highlighted',
    ExpressionAttributeValues: {
      ':highlighted': true,
    },
  }

  try {
    const result = await documentClient.scan(params).promise()
    return result.Items as Activity[]
  } catch (e) {
    throw new DatabaseError(e)
  }
}
