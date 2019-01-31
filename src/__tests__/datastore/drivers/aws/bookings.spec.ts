import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import { listBookingsForTravelBand } from '@datastore/drivers/aws/bookings'
import InternalServerError from '@errors/InternalServerError'

AWSMock.setSDKInstance(AWS)

test('list travel band bookings - database error', async () => {
  const mockedQuery = jest.fn((params: any, cb: any) => {
    throw new Error('error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedQuery)
  await expect(listBookingsForTravelBand(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(InternalServerError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('list travel band bookings with valid ID', async () => {
  const travelBandId = v4()
  const bookingId = v4()
  const bookings = [
    {
      travelBandId,
      bookingId,
      activity: {
        activityId: v4(),
        price: 100,
      },
    },
  ]
  const mockedQuery = jest.fn((params: any, cb: any) => {
    return cb(null, { Items: bookings })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'query', mockedQuery)
  const gotBookings = await listBookingsForTravelBand(new AWS.DynamoDB.DocumentClient(), travelBandId)
  expect(gotBookings.length).toBe(1)
  expect(gotBookings[0].bookingId).toBe(bookingId)
  AWSMock.restore('DynamoDB.DocumentClient')
})
