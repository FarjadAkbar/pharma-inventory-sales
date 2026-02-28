import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

function isConnectionError(err: any): boolean {
  const msg = String(err?.message ?? err ?? '');
  return /ECONNRESET|ECONNREFUSED|Connection closed|connect ECONNREFUSED|ETIMEDOUT|socket hang up/i.test(msg);
}

@Catch()
export class RpcConnectionExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcConnectionExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (isConnectionError(exception)) {
      this.logger.warn(`Microservice connection error: ${exception?.message}`);
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message:
          'A backend service is temporarily unavailable. Please try again or ensure all microservices are running.',
        error: 'Service Unavailable',
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json(typeof body === 'object' ? body : { message: body });
      return;
    }

    const status = exception?.status ?? exception?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const code = Number.isInteger(status) ? status : HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(code).json({
      statusCode: code,
      message: exception?.response?.message ?? exception?.message ?? 'Internal server error',
      error: exception?.response?.error ?? 'Error',
    });
  }
}
