import HTTPError from '@errors/HTTPError'
import { APIGatewayProxyResult } from 'aws-lambda'

/**
 * Handle an Error and return a serverless formatted response from given global error message, retrieved errors and status code
 * @param {string} message - Global error message
 * @param {number} statusCode - Status Code associated to the Error, to write in response
 * @param {string[]} errors - List of detailed error messages (validation failed for a resource creation for example)
 */
export const handleError = ({ message, statusCode, errors }: HTTPError): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify({
      message,
      errors: errors || undefined,
    }),
  }
}
