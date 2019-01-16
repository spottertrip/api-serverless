import HTTPError from '@errors/HTTPError';

export default class InternalServerError extends HTTPError {
  constructor(message: string) {
    super(message, 500)
  }
}
