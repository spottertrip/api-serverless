import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { IFolder } from '@models/Folder'
import TravelBand from '@models/TravelBand'
import InternalServerError from '@errors/InternalServerError'

export const createFolder = async (documentClient: DocumentClient, travelBand: TravelBand, folder: IFolder) => {
  const params = {
    TableName: 'travelBands',
    Key: {
      travelBandId: travelBand.travelBandId,
    },
    UpdateExpression: 'SET folders = :folders',
    ExpressionAttributeValues: {
      ':folders': [...travelBand.folders, folder],
    },
  }

  try {
    await documentClient.update(params).promise()
    return folder
  } catch (e) {
    throw new InternalServerError(e.message)
  }
}
