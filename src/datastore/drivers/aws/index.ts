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
  activityExistsInFolder,
  shareActivity,
  getTravelBandActivity,
  updateTravelBandActivity, listHighlightedActivities,
} from './activities'
import { listSpotters, getTravelBandIdsForSpotter, getSpotter, searchSpotters } from '@datastore/drivers/aws/spotters'
import { listAvailabilities } from '@datastore/drivers/aws/availabilities'
import {
  createFolder, getCountActivitiesInFolder,
  getFolder,
  listActivitiesInFolder,
  listFolders,
} from '@datastore/drivers/aws/folders'
import { getTravelBand, listTravelBands, createTravelBand } from '@datastore/drivers/aws/travelBands'
import { listBookingsForTravelBand, listAllBookings } from '@datastore/drivers/aws/bookings'
import { listCategories } from './categories';
import Activity from '@models/Activity';

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
  public shareActivity = (
    activityId: string,
    travelBandId: string,
    folderId: string,
  ) => shareActivity(this.documentClient, activityId, travelBandId, folderId)
  public getTravelBandActivity = (travelBandId: string, activityId: string) => getTravelBandActivity(this.documentClient, travelBandId, activityId)
  public updateTravelBandActivity = (activity: Activity) => updateTravelBandActivity(this.documentClient, activity)
  public listHighlightedActivities = () => listHighlightedActivities(this.documentClient)
  // Availabilities
  public listAvailabilities = (activityId: string) => listAvailabilities(this.documentClient, activityId)
  // Travel Band
  public createTravelBand = (travelBand: TravelBand) => createTravelBand(this.documentClient, travelBand)
  public getTravelBand = (travelBandId: string) => getTravelBand(this.documentClient, travelBandId)
  public listTravelBands = () => listTravelBands(this.documentClient)
  // Spotters
  public getSpotter = (spotterId: string) => getSpotter(this.documentClient, spotterId)
  public listSpotters = (travelBandId: string) => listSpotters(this.documentClient, travelBandId)
  public getTravelBandIdsForSpotter = (spotterId: string) => getTravelBandIdsForSpotter(this.documentClient, spotterId)
  public searchSpotters = (query: string) =>
    searchSpotters(this.documentClient, query)
  // Folders
  public getFolder = (travelBandId: string, folderId: string) => getFolder(this.documentClient, travelBandId, folderId)
  public listFolders = (travelBandId: string) => listFolders(this.documentClient, travelBandId)
  public createFolder = (travelBand: TravelBand, folder: IFolder) => createFolder(this.documentClient, travelBand, folder)
  public listActivitiesInFolder = (travelBandId: string, folderId: string) => listActivitiesInFolder(this.documentClient, travelBandId, folderId)
  public getCountActivitiesInFolder = (
    travelBandId: string,
    folderId: string,
  ) => getCountActivitiesInFolder(this.documentClient, travelBandId, folderId)
  // Bookings
  public listAllBookings = (spotterId: string) => listAllBookings(this.documentClient, spotterId)
  public listBookingsForTravelBand = (travelBandId: string) => listBookingsForTravelBand(this.documentClient, travelBandId)
  // Categories
  public listCategories = () => listCategories(this.documentClient)
}
