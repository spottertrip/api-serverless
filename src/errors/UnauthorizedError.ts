import HTTPError from './HTTPError'

export default class UnauthorizedError extends HTTPError {
  constructor(message: string) {
    super(message, 401)
  }
}
