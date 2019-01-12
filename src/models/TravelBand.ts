import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'
import AttributeMap = DocumentClient.AttributeMap
import Activity from '@models/Activity'

export default interface TravelBand extends AttributeMap {
  name: string
  description: string
  spotters: any[]
  activities: Activity[]
  bookings: any[]
}
