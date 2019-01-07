// Datastore implements every repositories
export interface DataStore {
  getActivity: (id: string) => Promise<any>
  listActivities: () => Promise<any[]>
  deleteActivity: (id: string) => Promise<void>
  updateActivity: () => Promise<any>
}
