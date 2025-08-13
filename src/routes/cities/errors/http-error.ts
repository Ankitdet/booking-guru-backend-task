import { HttpStatus } from "@nestjs/common";

export class HttpError extends Error {
  private readonly status: HttpStatus;
  constructor(
    public readonly message: any,
    public readonly statusCode: HttpStatus,
    public readonly error?: string
  ) {
    super(message);
  }

  public getStatus(): HttpStatus {
    return this.status;
  }
}
