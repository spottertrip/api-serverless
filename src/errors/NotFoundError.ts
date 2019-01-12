import HTTPError from '@errors/HTTPError'

export default class NotFoundError extends HTTPError {
  constructor(message: string) {
    super(message, 404)
  }
}
