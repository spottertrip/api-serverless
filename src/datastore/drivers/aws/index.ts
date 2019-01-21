import { DataStore } from '../../datastore'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// Repositories
import {
  listActivities,
  getActivity,
  deleteActivity,
  updateActivity, listTravelBandActivities, listTravelBandBookings,
} from './activities'
import { listSpotters } from '@datastore/drivers/aws/spotters'
import { listAvailabilities } from '@datastore/drivers/aws/availabilities'

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
  public listActivities = (
    lastEvaluatedId: string = '',
    itemsPerPage: number = 20,
  ) => listActivities(this.documentClient, lastEvaluatedId, itemsPerPage)
  public getActivity = getActivity
  public deleteActivity = deleteActivity
  public updateActivity = updateActivity
  public listTravelBandActivities = (travelBandId: string) => listTravelBandActivities(this.documentClient, travelBandId)
  public listTravelBandBookings = (travelBandId: string) => listTravelBandBookings(this.documentClient, travelBandId)
  // Availabilities
  public listAvailabilities = (activityId: string) => listAvailabilities(this.documentClient, activityId)
  // Spotters
  public listSpotters = (travelBandId: string) => listSpotters(this.documentClient, travelBandId)
}
