import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'
import AttributeMap = DocumentClient.AttributeMap
import Activity from '@models/Activity'
import ISpotter from '@models/Spotter'

export default interface TravelBand extends AttributeMap {
  name: string
  description: string
  activities: Activity[]
  spotters: ISpotter[]
  bookings: Activity[]
}
