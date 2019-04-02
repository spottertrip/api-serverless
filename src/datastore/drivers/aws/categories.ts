import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { ICategory } from '@models/Category';
import DatabaseError from '@errors/DatabaseError';

/**
 * List availabilities for an activity
 * @param documentClient - Amazon DynamoDB Document Client to access data store
 * @param activityId - ID of the activity to retrieve availabilities for
 */
export const listCategories = async (documentClient: DocumentClient) => {
  const params = {
    TableName: process.env.DB_TABLE_CATEGORIES,
  }

  try {
    const result = await documentClient.scan(params).promise()
    return result.Items as ICategory[]
  } catch (e) {
    throw new DatabaseError(e.message)
  }
}
