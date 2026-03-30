export abstract class BaseException extends Error {
  constructor(
    public readonly errorCode: string,
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
