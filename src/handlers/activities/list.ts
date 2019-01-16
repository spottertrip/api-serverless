import { datastore } from '@datastore/index';
import HTTPError from '@errors/HTTPError';
import * as validateUUID from 'uuid-validate'
import { t } from '@helpers/i18n';
import { handleError } from '@helpers/http'
import BadRequestError from '@errors/BadRequestError'

/**
 * Retrieve a paginated list of activities
 * @param event - Event containing Query Parameters for pagination:
 * - lastEvaluatedId: ID of the last retrieved activity if not on the first page
 * - itemsPerPage: Number of items to retrieve per page
 * @param context
 * @returns a list of activities, as well as last ID of activitiy retrieved for further pagination
 */
export const listActivities = async (event, context) => {
  // Get query parameters for pagination
  const lastEvaluatedId: string = event.queryStringParameters && event.queryStringParameters.lastEvaluatedId || ''
  const itemsPerPage: number = event.queryStringParameters && +event.queryStringParameters.itemsPerPage || 20

  // Validate that last Evaluated id is a valid UUID if provided
  if (lastEvaluatedId && !validateUUID(lastEvaluatedId)) {
    return handleError(new BadRequestError(t('errors.activities.invalid_lastEvaluatedId')))
  }

  try {
    const { lastEvaluatedId: retrievedLastEvaluatedId, activities } = await datastore.listActivities(lastEvaluatedId, itemsPerPage)

    return {
      statusCode: 200,
      body: JSON.stringify({
        activities,
        lastEvaluatedId: retrievedLastEvaluatedId,
      }),
    }
  } catch (e) {
    const error = e as HTTPError
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        message: error.message,
      }),
    }
  }
}
