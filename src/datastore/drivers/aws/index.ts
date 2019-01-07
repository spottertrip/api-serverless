import { DataStore } from '../../datastore'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// Repositories
import {
  listActivities,
  getActivity,
  deleteActivity,
  updateActivity,
} from './activities'

export interface AWSOptions {
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
};

export default class AWSDataStore implements DataStore {
  private documentClient: DocumentClient

  constructor(options: AWSOptions) {
    this.documentClient = new DocumentClient(options);
  }

  public getActivity = getActivity
  public listActivities = listActivities
  public deleteActivity = deleteActivity
  public updateActivity = updateActivity
}
