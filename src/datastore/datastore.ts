// Datastore implements every repositories
import Activity from '@models/Activity'
import ISpotter from '@models/Spotter'

export interface DataStore {
  getActivity: (id: string) => Promise<any>
  listActivities: () => Promise<any[]>
  deleteActivity: (id: string) => Promise<void>
  updateActivity: () => Promise<any>
  listTravelBandActivities: (travelBandId: string) => Promise<Activity[]>
  listTravelBandBookings: (travelBandId: string) => Promise<Activity[]>
  // Spotters
  listSpotters: (travelBandId: string) => Promise<ISpotter[]>
}
