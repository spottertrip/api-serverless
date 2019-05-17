import ValidationError from '@errors/ValidationError'
import { v4 } from 'uuid'
import { validateTravelBand } from '@validators/travelBands';
import TravelBand from '@models/TravelBand';

const fixtureTravelBand: TravelBand = {
  travelBandId: v4(),
  name: '',
  description: '',
  spotters: [],
  bookings: [],
  folders: [],
  thumbnailUrl: '',
  activityCount: 0,
}

test('invalid folder - name missing', async () => {
  const travelBand: TravelBand = {
    ...fixtureTravelBand,
    name: '',
    description: '',
  }
  await expect(validateTravelBand(travelBand)).rejects.toThrow(ValidationError)
})

test('invalid travel band - name too short', async () => {
  const travelBand = {
    ...fixtureTravelBand,
    name: 'sh',
    description: '',
  }
  await expect(validateTravelBand(travelBand)).rejects.toThrow(ValidationError)
})

test('invalid travel band - name too long', async () => {
  const travelBand = {
    ...fixtureTravelBand,
    name: 'invalid name, way too big as it is more than 20 characters',
    description: '',
  }
  await expect(validateTravelBand(travelBand)).rejects.toThrow(ValidationError)
})

test('invalid travel band - description too long', async () => {
  const travelBand = {
    ...fixtureTravelBand,
    name: 'valid name',
    description: 'description too long, limit is 120 characters, so users do not pollute their beautiful travel bands with too long descriptions',
  }
  await expect(validateTravelBand(travelBand)).rejects.toThrow(ValidationError)
})

test('valid travel band - no description', async () => {
  const travelBand = {
    ...fixtureTravelBand,
    name: 'test valid',
    description: '',
  }
  await validateTravelBand(travelBand)
})

test('valid travel band - with description', async () => {
  const travelBand = {
    ...fixtureTravelBand,
    name: 'test valid',
    description: 'Testing description for travel band',
  }
  await validateTravelBand(travelBand)
})
