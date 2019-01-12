import { DataStore } from '@datastore/datastore'
import AWSDriver, { AWSOptions } from '@datastore/drivers/aws'

export let datastore: DataStore
export const initializeDB = (options: AWSOptions) => {
  // Initialize Database Connection
  datastore = new AWSDriver(options)
}
