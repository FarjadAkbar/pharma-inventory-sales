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
      case ErrorCode.UNAUTHORIZED:
        return HttpStatus.UNAUTHORIZED;
      case ErrorCode.FORBIDDEN:
        return HttpStatus.FORBIDDEN;
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

  private errorCodeForHttpStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_FAILED;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ErrorCode.BUSINESS_RULE_VIOLATION;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }

  private coerceHttpStatus(raw: unknown): number | undefined {
    const n = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    if (typeof n === 'number' && !Number.isNaN(n) && n >= 400 && n <= 599) {
      return n;
    }
    return undefined;
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

    const nestedRpc = exception?.message;
    const nestedStatusFromMessage =
      typeof nestedRpc === 'object' && nestedRpc !== null
        ? (nestedRpc as { statusCode?: unknown }).statusCode
        : undefined;

    const rpcHttpStatus =
      this.coerceHttpStatus(exception?.status) ??
      this.coerceHttpStatus(exception?.statusCode) ??
      this.coerceHttpStatus(exception?.response?.statusCode) ??
      this.coerceHttpStatus(nestedStatusFromMessage);

    if (rpcHttpStatus != null) {
      const msg = normalizeMessage(
        (typeof nestedRpc === 'object' && nestedRpc !== null && 'message' in nestedRpc
          ? (nestedRpc as { message?: unknown }).message
          : undefined) ??
          exception?.response?.message ??
          exception?.message ??
          exception?.response ??
          exception?.error,
      );
      this.sendError(
        response,
        rpcHttpStatus,
        this.errorCodeForHttpStatus(rpcHttpStatus),
        msg,
      );
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      let rawMsg: unknown = body;
      if (typeof body === 'object' && body !== null && 'message' in body) {
        rawMsg = (body as { message: unknown }).message;
      }
      this.sendError(
        response,
        status,
        this.errorCodeForHttpStatus(status),
        normalizeMessage(rawMsg),
      );
      return;
    }

    const status = this.coerceHttpStatus(exception?.status ?? exception?.statusCode);
    const httpStatus = status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const nestedMsg =
      typeof nestedRpc === 'object' && nestedRpc !== null && 'message' in nestedRpc
        ? (nestedRpc as { message: unknown }).message
        : undefined;
    this.sendError(
      response,
      httpStatus,
      this.errorCodeForHttpStatus(httpStatus),
      normalizeMessage(
        nestedMsg ??
          exception?.response?.message ??
          (typeof exception?.message === 'string' ? exception.message : undefined) ??
          'Internal server error',
      ),
      exception?.response?.details,
    );
  }
}
