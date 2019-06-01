import { datastore } from '@datastore/index';
import { handleError } from '@helpers/http';
import { IBooking } from '@models/Booking';

export const listAllBookings = async (event, context) => {
  let bookings: IBooking[] = []
  // TODO: remove hard coded user ID when Authentication is ready.
  const userId = '15a992e1-8d3f-421e-99a3-2ba5d2131d82'

  // Fetch Bookings
  try {
    bookings = await datastore.listAllBookings(userId);
  } catch (error) {
    return handleError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ bookings }),
  }
}
