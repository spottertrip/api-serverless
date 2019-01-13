import { listTravelBandActivities } from '@handlers/travelBands';
import BadRequestError from '@errors/BadRequestError';
import {APIGatewayEventRequestContext, APIGatewayProxyEvent} from "aws-lambda";

jest.mock('@datastore/index', () => ({
  datastore: {
    listTravelBandActivities: jest.fn((travelBandId: string) => {
      throw new BadRequestError('toto')
    }),
  },
}))

const defaultEvent: APIGatewayProxyEvent = {
  body: null,
  headers: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  path: '/travel-bands/'
  pathParameters: { [name: string]: string } | null;
  queryStringParameters: { [name: string]: string } | null;
  stageVariables: { [name: string]: string } | null;
  requestContext: APIGatewayEventRequestContext;
  resource: string;
}

const datastore = require('@datastore/index')

test('list travel band activities without ID returns bad request', async () => {
  datastore.listTravelBandActivities = jest.fn((travelBandId: string) => {
    throw new BadRequestError('Testing')
  })
  const response = await listTravelBandActivities(null, null, null)
  console.log(response)
})
