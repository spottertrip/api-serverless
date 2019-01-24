export default class HTTPError extends Error {
  public readonly message: string
  public readonly statusCode: number
  public errors?: string[]

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}
