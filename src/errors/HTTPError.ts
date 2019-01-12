export default class HTTPError extends Error {
  public readonly message
  public readonly statusCode

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}
