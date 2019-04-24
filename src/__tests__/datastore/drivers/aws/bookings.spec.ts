import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { v4 } from 'uuid'
import { listBookingsForTravelBand, listAllBookings } from '@datastore/drivers/aws/bookings'
import InternalServerError from '@errors/InternalServerError'
import NotFoundError from '@errors/NotFoundError';
import DatabaseError from '@errors/DatabaseError';

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

// --- List Bookings for a spotter

test('get bookigns for a spotter with not existing ID -> not found', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: null })
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(listAllBookings(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(NotFoundError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('get bookings for a spotter - database error', async () => {
  const mockedGet = jest.fn((params: any, cb: any) => {
    throw new Error('db error')
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  await expect(listAllBookings(new AWS.DynamoDB.DocumentClient(), v4())).rejects.toThrow(DatabaseError)
  AWSMock.restore('DynamoDB.DocumentClient')
})

test('get travel band ids for spotters with valid ID', async () => {
  const spotterId = v4()
  const mockedGet = jest.fn((params: any, cb: any) => {
    return cb(null, { Item: { travelBands: [v4(), v4(), v4()] } })
  })
  const mockedBookings = jest.fn((params: any, cb: any) => {
    return cb(null, { Items: [
      {
        bookingId: v4(),
      },
      {
        bookingId: v4(),
      },
    ]})
  })
  AWSMock.mock('DynamoDB.DocumentClient', 'get', mockedGet)
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', mockedBookings)
  const bookings = await listAllBookings(new AWS.DynamoDB.DocumentClient(), spotterId)
  expect(bookings.length).toBe(2)
  AWSMock.restore('DynamoDB.DocumentClient')
})
