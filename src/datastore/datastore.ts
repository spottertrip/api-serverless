// Datastore implements every repositories
import Activity from '@models/Activity'
import ISpotter from '@models/Spotter'
import { ListActivityOutput } from '@datastore/types'

export interface DataStore {
  // Activities
  getActivity: (id: string) => Promise<any>
  listActivities: (lastEvaluatedId: string, itemsPerPage: number) => Promise<ListActivityOutput>
  deleteActivity: (id: string) => Promise<void>
  updateActivity: () => Promise<any>
  listTravelBandActivities: (travelBandId: string) => Promise<Activity[]>
  listTravelBandBookings: (travelBandId: string) => Promise<Activity[]>
  // Spotters
  listSpotters: (travelBandId: string) => Promise<ISpotter[]>
}
