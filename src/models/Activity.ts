import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'
import AttributeMap = DocumentClient.AttributeMap
import Address from '@models/Address'

export default interface Activity extends AttributeMap {
  name: string
  description: string
  picture: string
  duration: number
  language: string
  category: string
  services: string[]
  capacity: number
  price: number
  address: Address
}
