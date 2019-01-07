import { DataStore } from '@datastore/datastore'
import aws, { AWSOptions } from '@datastore/drivers/aws'

export let datastore: DataStore
export const initializeDB = (options: AWSOptions) => {
  // Initialize Database Connection
  datastore = new aws(options)
}
