import { datastore } from '@datastore/index';
import HTTPError from '@errors/HTTPError';
import * as validateUUID from 'uuid-validate'
import { t } from '@helpers/i18n';
import { handleError } from '@helpers/http'
import BadRequestError from '@errors/BadRequestError'
import { FilterActivitiesOptions } from '@datastore/types';

type ListActivitiesQueryParams = {
  lastEvaluatedId: string,
  itemsPerPage: string,
  priceMin: string,
  priceMax: string,
  category: string,
  q: string,
}

/**
 * Retrieve a paginated list of activities
 * @param event - Event containing Query Parameters for pagination:
 * - lastEvaluatedId: ID of the last retrieved activity if not on the first page
 * - itemsPerPage: Number of items to retrieve per page
 * @param context
 * @returns a list of activities, as well as last ID of activitiy retrieved for further pagination
 */
export const listActivities = async (event, context) => {
  const params: ListActivitiesQueryParams = event.queryStringParameters || {}
  // Get query parameters
  const lastEvaluatedId = params.lastEvaluatedId || ''
  const itemsPerPage = parseInt(params.itemsPerPage, 0) || 20
  const priceMin = parseInt(params.priceMin, 0) || 0
  const priceMax = parseInt(params.priceMax, 0) || 0
  const category = params.category || ''
  const q = params.q || ''

  // Validate that last Evaluated id is a valid UUID if provided
  if (lastEvaluatedId && !validateUUID(lastEvaluatedId)) {
    return handleError(new BadRequestError(t('errors.activities.invalid_lastEvaluatedId')))
  }

  try {
    const filterOptions: FilterActivitiesOptions = {
      lastEvaluatedId,
      itemsPerPage,
      priceMax,
      priceMin,
      category,
      q,
    }
    const { lastEvaluatedId: retrievedLastEvaluatedId, activities } = await datastore.listActivities(filterOptions)

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
