import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '@repo/shared';

function isConnectionError(err: any): boolean {
  const msg = String(err?.message ?? err ?? '');
  return /ECONNRESET|ECONNREFUSED|Connection closed|connect ECONNREFUSED|ETIMEDOUT|socket hang up/i.test(msg);
}

@Catch()
export class RpcConnectionExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcConnectionExceptionFilter.name);

  private mapCodeToHttpStatus(code?: string): number {
    switch (code) {
      case ErrorCode.VALIDATION_FAILED:
        return HttpStatus.BAD_REQUEST;
      case ErrorCode.NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case ErrorCode.STOCK_INSUFFICIENT:
      case ErrorCode.BATCH_NOT_RELEASED:
      case ErrorCode.BUSINESS_RULE_VIOLATION:
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case ErrorCode.SERVICE_UNAVAILABLE:
        return HttpStatus.SERVICE_UNAVAILABLE;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private sendError(
    response: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    response.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
    });
  }

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (isConnectionError(exception)) {
      this.logger.warn(`Microservice connection error: ${exception?.message}`);
      this.sendError(
        response,
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.SERVICE_UNAVAILABLE,
        'A backend service is temporarily unavailable. Please try again or ensure all microservices are running.',
      );
      return;
    }

    const payload =
      exception?.response?.error ??
      exception?.response ??
      exception?.message ??
      exception;
    const maybeCode = payload?.code as string | undefined;
    if (maybeCode) {
      const status = this.mapCodeToHttpStatus(maybeCode);
      this.sendError(
        response,
        status,
        maybeCode,
        payload?.message || exception?.message || 'Request failed',
        payload?.details,
      );
      return;
    }

    const normalizeMessage = (m: unknown): string => {
      if (m == null) return 'Request failed';
      if (Array.isArray(m)) return m.map((x) => String(x)).join(', ');
      if (typeof m === 'object' && m !== null && 'message' in m) {
        return normalizeMessage((m as { message: unknown }).message);
      }
      return String(m);
    };

    const rpcHttpStatusRaw = exception?.status ?? exception?.statusCode ?? exception?.response?.statusCode;
    const rpcHttpStatus =
      typeof rpcHttpStatusRaw === 'number' && rpcHttpStatusRaw >= 400 && rpcHttpStatusRaw <= 599
        ? rpcHttpStatusRaw
        : undefined;
    if (rpcHttpStatus != null) {
      const msg = normalizeMessage(
        exception?.response?.message ?? exception?.message ?? exception?.response ?? exception?.error,
      );
      this.sendError(response, rpcHttpStatus, ErrorCode.INTERNAL_ERROR, msg);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const rawMsg = typeof body === 'object' ? (body as any)?.message : body;
      this.sendError(response, status, ErrorCode.INTERNAL_ERROR, normalizeMessage(rawMsg));
      return;
    }

    const status = exception?.status ?? exception?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const code = Number.isInteger(status) ? status : HttpStatus.INTERNAL_SERVER_ERROR;
    this.sendError(
      response,
      code,
      ErrorCode.INTERNAL_ERROR,
      normalizeMessage(
        exception?.response?.message ?? exception?.message ?? 'Internal server error',
      ),
      exception?.response?.details,
    );
  }
}
