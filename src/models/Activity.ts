import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'
import AttributeMap = DocumentClient.AttributeMap
import Address from '@models/Address'
import { IAvailability } from '@models/Availability'
import { IOffice } from './Office';

export default interface Activity extends AttributeMap {
  activityId: string
  name: string
  description: string
  pictures: string[]
  duration: number
  language: string
  category: string
  services: string[]
  capacity: number
  price: number
  mark: number
  nbVotes: number
  address: Address
  availabilities?: IAvailability[]
  office: IOffice
}
