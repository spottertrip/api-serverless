import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'
import AttributeMap = DocumentClient.AttributeMap

export default interface ISpotter extends AttributeMap {
  spotterId: string
  thumbnailUrl: string
  username: string
  email: string
  travelBands?: string[]
}
