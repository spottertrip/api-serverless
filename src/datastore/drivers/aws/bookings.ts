import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import DatabaseError from '@errors/DatabaseError'
import { IBooking } from '@models/Booking'
import { getTravelBandIdsForSpotter } from './spotters';

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

export const listAllBookings = async (documentClient: DocumentClient, spotterId: string): Promise<IBooking[]> => {
  const travelBandIds = await getTravelBandIdsForSpotter(documentClient, spotterId);
  if (!travelBandIds.length) return [];
  console.log(travelBandIds);

  let filterExpression = ''
  const expressionAttributeValues = {};
  travelBandIds.forEach((travelBandId: string, index: number) => {
    // Create filter expression string by concatenating expressions
    if (filterExpression !== '') filterExpression += ','
    const filterName = `:travelBandId${index}`
    filterExpression += filterName
    expressionAttributeValues[filterName] = travelBandId
  })

  const params = {
    TableName: process.env.DB_TABLE_BOOKINGS,
    FilterExpression: `travelBandId IN (${filterExpression})`,
    ExpressionAttributeValues: expressionAttributeValues,
  }

  let result
  try {
    result = await documentClient.scan(params).promise()
  } catch (e) {
    throw new DatabaseError(e)
  }
  return result.Items as IBooking[]
}
