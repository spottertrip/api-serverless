import { DocumentClient, QueryOutput } from 'aws-sdk/clients/dynamodb'
import DatabaseError from '@errors/DatabaseError'
import { IBooking } from '@models/Booking'

/**
 * Retrieve a list of bookings for a given travel band
 * @param {DocumentClient} documentClient - AWS DynamoDB Documentclient
 * @param {string} travelBandId - ID of the travel band
 */
export const listBookingsForTravelBand = async (documentClient: DocumentClient, travelBandId: string): Promise<IBooking[]> => {
  const params = {
    TableName: process.env.DB_TABLE_BOOKINGS,
    KeyConditionExpression: 'travelBandId = :travelBandId',
    ExpressionAttributeValues: {
      ':travelBandId': travelBandId,
    },
  }

  let result
  try {
    result = await documentClient.query(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }

  return result.Items as IBooking[]
}
