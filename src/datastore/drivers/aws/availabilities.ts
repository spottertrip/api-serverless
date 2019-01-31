import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import { IAvailability } from '@models/Availability'
import InternalServerError from '@errors/InternalServerError'

/**
 * List availabilities for an activity
 * @param documentClient - Amazon DynamoDB Document Client to access data store
 * @param activityId - ID of the activity to retrieve availabilities for
 */
export const listAvailabilities = async (documentClient: DocumentClient, activityId: string) => {
  if (!activityId) {
    throw new BadRequestError(t('errors.errors.missingId'))
  }

  // TODO: Add Range of dates start and end to query all availabilities between this range
  const queryParams = {
    TableName: process.env.DB_TABLE_AVAILABILITIES,
    KeyConditionExpression: 'activityId = :id',
    ExpressionAttributeValues: {
      ':id': activityId,
    },
  }

  try {
    const result = await documentClient.query(queryParams).promise()
    return result.Items as IAvailability[]
  } catch (e) {
    throw new InternalServerError(e.message)
  }
}
