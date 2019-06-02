// Datastore implements every repositories
import Activity from '@models/Activity'
import ISpotter from '@models/Spotter'
import { ListActivityOutput, FilterActivitiesOptions } from '@datastore/types'
import { IAvailability } from '@models/Availability'
import { IFolder } from '@models/Folder'
import TravelBand from '@models/TravelBand'
import { IBooking } from '@models/Booking'
import { ICategory } from '@models/Category'

export interface DataStore {
  // Activities
  getActivity: (activityId: string) => Promise<Activity>
  listActivities: (options: FilterActivitiesOptions) => Promise<ListActivityOutput>
  deleteActivity: (id: string) => Promise<void>
  updateActivity: () => Promise<any>
  shareActivity: (activityId: string, travelBandId: string, folderId: string) => Promise<boolean>
  activityExistsInFolder: (activityId: string, travelBandId: string, folderId: string) => Promise<boolean>
  listTravelBandActivities: (travelBandId: string) => Promise<Activity[]>
  getTravelBandActivity: (travelBandId: string, activityId: string) => Promise<Activity>
  updateTravelBandActivity: (activity: Activity) => Promise<void>
  listHighlightedActivities: () => Promise<Activity[]>
  // Travel Bands
  createTravelBand: (travelBand: TravelBand) => Promise<TravelBand>
  getTravelBand: (travelBandId: string) => Promise<TravelBand>
  listTravelBands: () => Promise<TravelBand[]>
  listTravelBandsForSpotter: (spotterId: string) => Promise<TravelBand[]>
  // Folders
  listFolders: (travelBandId: string) => Promise<IFolder[]>
  createFolder: (travelBand: TravelBand, folder: IFolder) => Promise<IFolder>
  getFolder: (travelBandId: string, folderId: string) => Promise<IFolder>
  listActivitiesInFolder: (travelBandId: string, folderId: string) => Promise<Activity[]>
  getCountActivitiesInFolder: (travelBandId: string, folderId: string) => Promise<number>
  // Availabilities
  listAvailabilities: (activityId: string) => Promise<IAvailability[]>
  // Spotters
  getSpotter: (spotterId: string) => Promise<ISpotter>
  listSpotters: (travelBandId: string) => Promise<ISpotter[]>
  getTravelBandIdsForSpotter: (spotterId: string) => Promise<string[]>;
  searchSpotters: (query: string) => Promise<ISpotter[]>
  inviteSpotterToTravelBand: (spotterId: string, travelBandId: string) => Promise<ISpotter>
  // Bookings
  listAllBookings: (spotterId: string) => Promise<IBooking[]>;
  listBookingsForTravelBand: (travelBandId: string) => Promise<IBooking[]>
  // Categories
  listCategories: () => Promise<ICategory[]>
}
