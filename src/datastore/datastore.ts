// Datastore implements every repositories
import TravelBand from '@models/TravelBand'
import Activity from '@models/Activity'

export interface DataStore {
  getActivity: (id: string) => Promise<any>
  listActivities: () => Promise<any[]>
  deleteActivity: (id: string) => Promise<void>
  updateActivity: () => Promise<any>
  listTravelBandActivities: (travelBandId: string) => Promise<Activity[]>
}
