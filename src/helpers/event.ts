import * as validateUUID from 'uuid-validate'
import InvalidUUIDError from '@errors/InvalidUUIDError'

/**
 * Get ID from path
 * @param {string} parameterName - name of the parameter to retrieve from path
 * @param {Object} pathParameters - Map of parameters found in path
 */
export const getIdFromPath = (parameterName: string, pathParameters: any) => {
  const pathId: string = pathParameters && pathParameters[parameterName] || ''
  if (!pathId || !validateUUID(pathId)) {
    throw new InvalidUUIDError(parameterName)
  }
  return pathId
}
