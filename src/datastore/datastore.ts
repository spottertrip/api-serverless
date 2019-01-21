// Datastore implements every repositories
import Activity from '@models/Activity'
import ISpotter from '@models/Spotter'
import { ListActivityOutput } from '@datastore/types'
import { IAvailability } from '@models/Availability'

export interface DataStore {
  // Activities
  getActivity: (id: string) => Promise<any>
  listActivities: (lastEvaluatedId: string, itemsPerPage: number) => Promise<ListActivityOutput>
  deleteActivity: (id: string) => Promise<void>
  updateActivity: () => Promise<any>
  listTravelBandActivities: (travelBandId: string) => Promise<Activity[]>
  listTravelBandBookings: (travelBandId: string) => Promise<Activity[]>
  // Availabilities
  listAvailabilities: (activityId: string) => Promise<IAvailability[]>
  // Spotters
  listSpotters: (travelBandId: string) => Promise<ISpotter[]>
}
