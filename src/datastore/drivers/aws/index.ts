import { DataStore } from '../../datastore'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// Repositories
import {
  listActivities,
  getActivity,
  deleteActivity,
  updateActivity, listTravelBandActivities,
} from './activities'

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

  public getActivity = getActivity
  public listActivities = listActivities
  public deleteActivity = deleteActivity
  public updateActivity = updateActivity
  public listTravelBandActivities = (travelBandId: string) => listTravelBandActivities(this.documentClient, travelBandId)
}
