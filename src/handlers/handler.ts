import { config } from 'dotenv'
import { initializeDB } from '@datastore/index'

// DotENV Configuration
config()

const dbOptions = {
  endpoint: process.env.AWS_ENDPOINT,
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
