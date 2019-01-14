import { DataStore } from '../../datastore'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// Repositories
import {
  listActivities,
  getActivity,
  deleteActivity,
  updateActivity, listTravelBandActivities,
} from './activities'
import { listSpotters } from '@datastore/drivers/aws/spotters'

export interface AWSOptions {
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
}

export default class AWSDataStore implements DataStore {
  private readonly documentClient: DocumentClient

  constructor(options: AWSOptions) {
    this.documentClient = new DocumentClient(options)
  }

  // Activities
  public getActivity = getActivity
  public listActivities = listActivities
  public deleteActivity = deleteActivity
  public updateActivity = updateActivity
  public listTravelBandActivities = (travelBandId: string) => listTravelBandActivities(this.documentClient, travelBandId)
  // Spotters
  public listSpotters = (travelBandId: string) => listSpotters(this.documentClient, travelBandId)
}
