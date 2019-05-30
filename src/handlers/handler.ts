import { initializeDB } from '@datastore/index'

let dbOptions

if (!!process.env.IS_OFFLINE) {
  // IS_OFFLINE is set by the serverless-offline-plugin
  dbOptions = {
    endpoint: process.env.LOCAL_ENDPOINT,
    region: process.env.LOCAL_REGION,
  };
}

try {
  initializeDB(dbOptions)
} catch (error) {
  console.error('Some configuration parameters are missing')
  process.exit(1)
}

// Serverless handlers
export * from './travelBands'
export * from './activities'
export * from './availabilities'
export * from './folders'
export * from './bookings'
export * from './categories'
export * from './spotters'
