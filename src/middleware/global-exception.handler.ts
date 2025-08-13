import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { HttpError } from "../routes/cities/errors/http-error";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = "Internal server error";
    let error: string | undefined;

    if (exception instanceof HttpError) {
      // Handle your custom HttpError
      status = exception.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = exception.error;
    } else if (exception instanceof HttpException) {
      // Handle built-in NestJS HttpExceptions
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        message = (res as any).message ?? message;
        error = (res as any).error;
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: error || HttpStatus[status] || undefined,
      timestamp: new Date().toISOString(),
    });
  }
}