import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'
import AttributeMap = DocumentClient.AttributeMap
import Activity from '@models/Activity'
import ISpotter from '@models/Spotter'
import { IFolder } from '@models/Folder'

export default interface TravelBand extends AttributeMap {
  travelBandId: string
  name: string
  description: string
  activities: Activity[]
  spotters: ISpotter[]
  bookings: Activity[]
  folders: IFolder[]
}
