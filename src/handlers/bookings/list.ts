import TravelBand from '@models/TravelBand'
import { handleError } from '@helpers/http'
import BadRequestError from '@errors/BadRequestError'
import { t } from '@helpers/i18n'
import { getIdFromPath } from '@helpers/event'
import { datastore } from '@datastore/index'
import { IBooking } from '@models/Booking'

/**
 * List bookings for a travel band
 * @param event - event
 * @param context - context
 */
export const listBookingsForTravelBand = async (event, context) => {
  let travelBandId: string
  let travelBand: TravelBand
  let bookings: IBooking[]

  try {
    travelBandId = getIdFromPath('travelBandId', event.pathParameters)
  } catch (e) {
    return handleError(new BadRequestError(t('travelBands.errors.invalidUUID')))
  }

  // get travel band
  try {
    travelBand = await datastore.getTravelBand(travelBandId)
  } catch (e) {
    return handleError(e)
  }

  // get bookings
  try {
    bookings = await datastore.listBookingsForTravelBand(travelBand.travelBandId)
  } catch (e) {
    return handleError(e)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(bookings),
  }
}
