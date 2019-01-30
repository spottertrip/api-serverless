import { DataStore } from '../../datastore'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// Repositories
import TravelBand from '@models/TravelBand'
import { IFolder } from '@models/Folder'
import {
  listActivities,
  getActivity,
  deleteActivity,
  updateActivity,
  listTravelBandActivities,
  listTravelBandBookings,
  activityExistsInFolder,
  shareActivity,
} from './activities'
import { listSpotters } from '@datastore/drivers/aws/spotters'
import { listAvailabilities } from '@datastore/drivers/aws/availabilities'
import {
  createFolder,
  getFolder,
  listActivitiesInFolder,
  listFolders,
} from '@datastore/drivers/aws/folders'
import { getTravelBand } from '@datastore/drivers/aws/travelBands'

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
  public getActivity = (activityId: string) => getActivity(this.documentClient, activityId)
  public deleteActivity = deleteActivity
  public updateActivity = updateActivity
  public listTravelBandActivities = (travelBandId: string) => listTravelBandActivities(this.documentClient, travelBandId)
  public activityExistsInFolder = (
    activityId: string,
    travelBandId: string,
    folderId: string) => activityExistsInFolder(this.documentClient, activityId, travelBandId, folderId)
  public listTravelBandBookings = (travelBandId: string) => listTravelBandBookings(this.documentClient, travelBandId)
  public shareActivity = (
    activityId: string,
    travelBandId: string,
    folderId: string,
  ) => shareActivity(this.documentClient, activityId, travelBandId, folderId)
  // Availabilities
  public listAvailabilities = (activityId: string) => listAvailabilities(this.documentClient, activityId)
  // Travel Band
  public getTravelBand = (travelBandId: string) => getTravelBand(this.documentClient, travelBandId)
  // Spotters
  public listSpotters = (travelBandId: string) => listSpotters(this.documentClient, travelBandId)
  // Folders
  public getFolder = (travelBandId: string, folderId: string) => getFolder(this.documentClient, travelBandId, folderId)
  public listFolders = (travelBandId: string) => listFolders(this.documentClient, travelBandId)
  public createFolder = (travelBand: TravelBand, folder: IFolder) => createFolder(this.documentClient, travelBand, folder)
  public listActivitiesInFolder = (travelBandId: string, folderId: string) => listActivitiesInFolder(this.documentClient, travelBandId, folderId)
}
