import { datastore } from '@datastore/index'
import { t } from '@helpers/i18n';
import { handleError } from '@helpers/http'
import BadRequestError from '@errors/BadRequestError'

/**
 * Retrieve a paginated list of spotters based on a given query (username or email)
 * @param event - Event containing Query Parameters for pagination:
 * - lastEvaluatedId: ID of the last retrieved spotter if not on the first page
 * - itemsPerPage: Number of items to retrieve per page
 * @param context
 * @returns a list of spotter, as well as the ID of the last spotter retrieved for further pagination
 */
export const listSpotters = async (event, context) => {
  const query: string = event.queryStringParameters && event.queryStringParameters.q || ''

  if (!query.trim()) {
    return handleError(new BadRequestError(t('errors.spotters.invalidQuery')))
  }

  try {
    const spotters = await datastore.searchSpotters(query)

    return {
      statusCode: 200,
      body: JSON.stringify(spotters),
    }
  } catch (e) {
    return handleError(e)
  }
}
