import TravelBand from '@models/TravelBand'
import { datastore } from '@datastore/index'
import { handleError } from '@helpers/http'
import HTTPError from '@errors/HTTPError'
import { v4 } from 'uuid'
import ISpotter from '@models/Spotter';
import { validateTravelBand } from '@validators/travelBands'
import { defaultFolder, defaultTravelBandThumbnail } from '@constants/defaults'
import BadRequestError from '@errors/BadRequestError';
import { t } from '@helpers/i18n';

/**
 * Create a travel band Handler
 * @param event - AWS Event
 */
export const createTravelBand = async (event) => {
  // TODO: Remove when authentication is ready
  const spotterId = '15a992e1-8d3f-421e-99a3-2ba5d2131d82';
  let data
  try {
    data = JSON.parse(event.body)
  } catch (error) {
    return handleError(new BadRequestError(t('errors.travelBands.invalid')))
  }
  const travelBand: TravelBand = {
    travelBandId: v4(),
    name: data.name || '',
    description: data.description || undefined,
    spotters: [],
    bookings: [],
    folders: [
      { ...defaultFolder },
    ],
    // TODO: Default thunbnail for travel bands
    thumbnailUrl: defaultTravelBandThumbnail,
    activityCount: 0,
  }

  // validate user input for travel band
  try {
    await validateTravelBand(travelBand)
  } catch (e) {
    return handleError(e as HTTPError)
  }

  let spotter: ISpotter
  try {
    // TODO: remove when authentication is done
    spotter = await datastore.getSpotter(spotterId);
  } catch (error) {
    return handleError(error as HTTPError)
  }

  travelBand.spotters[0] = {
    spotterId: spotter.spotterId,
    username: spotter.username,
    thumbnailUrl: spotter.thumbnailUrl,
  }

  try {
    await datastore.createTravelBand(travelBand)
  } catch (e) {
    return handleError(e as HTTPError)
  }

  return {
    statusCode: 201,
    body: JSON.stringify(travelBand),
  }
}
