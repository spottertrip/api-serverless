import BadRequestError from '@errors/BadRequestError'

export default class ValidationError extends BadRequestError {
  constructor(message: string, errors: string[]) {
    super(message)
    this.errors = errors
  }
}
