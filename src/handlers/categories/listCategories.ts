import { datastore } from '@datastore/index';
import { handleError } from '@helpers/http'
import { translateCategories } from '@helpers/translations';

/**
 * Retrieve a paginated list of activities
 * @param event - Lambda event object
 * @param context
 * @returns a list of categories of activities
 */
export const listCategories = async (event, context) => {
  try {
    const categories = await datastore.listCategories()
    const translatedCategories = translateCategories(categories)
    return {
      statusCode: 200,
      body: JSON.stringify({
        categories: translatedCategories,
        count: translatedCategories.length,
      }),
    }
  } catch (e) {
    return handleError(e)
  }
}
