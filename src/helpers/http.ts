import HTTPError from '@errors/HTTPError'
import { APIGatewayProxyResult } from 'aws-lambda'

export const handleError = ({ message, statusCode, errors }: HTTPError): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify({
      message,
      errors: errors || undefined,
    }),
  }
}
