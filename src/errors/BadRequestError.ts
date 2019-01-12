import HTTPError from './HTTPError'

export default class BadRequestError extends HTTPError {
  constructor(message: string) {
    super(message, 400)
  }
}
