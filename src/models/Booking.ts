import Activity from '@models/Activity';

export interface IBooking {
  bookingId: string
  travelBandId: string
  activity: Activity
  start: Date
  end: Date
}
