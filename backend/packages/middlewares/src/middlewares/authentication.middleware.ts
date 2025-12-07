import { Injectable, NestMiddleware } from '@nestjs/common';
import { SpanStatusCode } from '@opentelemetry/api';
import { NextFunction, Request, Response } from 'express';

import { ICacheAdapter } from '@pharma/infra/cache';
import { ILoggerAdapter } from '@pharma/infra/logger';
import { ITokenAdapter } from '@pharma/libs/token';
import { TracingType, UserRequest } from '@pharma/utils/request';
import { UUIDUtils } from '@pharma/utils/uuid';
import { ApiUnauthorizedException } from '@pharma/utils/exception';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: ITokenAdapter,
    private readonly loggerService: ILoggerAdapter,
    private readonly redisService: ICacheAdapter
  ) {}
  async use(
    request: Request & { user: UserRequest; id: string; tracing?: TracingType },
    response: Response,
    next: NextFunction
  ): Promise<void> {
    const tokenHeader = request.headers.authorization;

    if (!request.headers?.traceid) {
      Object.assign(request.headers, { traceid: request['id'] ?? UUIDUtils.create() });
    }

    if (!tokenHeader) {
      response.status(ApiUnauthorizedException.STATUS);
      request.id = request.headers.traceid as string;
      this.loggerService.logger(request, response);
      this.finishTracing(request, ApiUnauthorizedException.STATUS, 'no token provided');
      throw new ApiUnauthorizedException('no token provided');
    }

    const token = tokenHeader?.split(' ')[1] || '';

    const expiredToken = await this.redisService.get(token);

    request.id = request.headers.traceid as string;

    if (expiredToken) {
      this.finishTracing(request, ApiUnauthorizedException.STATUS, 'you have been logged out');
      next(new ApiUnauthorizedException('you have been logged out'));
    }

    const userDecoded = (await this.tokenService.verify<UserRequest>(token).catch((error) => {
      error.status = ApiUnauthorizedException.STATUS;
      if (process.env.NODE_ENV !== 'test') {
        this.loggerService?.logger(request, response);
      }
      this.finishTracing(request, ApiUnauthorizedException.STATUS, 'invalidToken');
      next(error);
    })) as UserRequest;

    request.user = userDecoded;

    next();
  }

  private finishTracing(request: { tracing?: TracingType }, status: number, message: string) {
    if (request?.tracing) {
      request.tracing.addAttribute('http.status_code', status);
      request.tracing.setStatus({ message, code: SpanStatusCode.ERROR });
      request.tracing.finish();
    }
  }
}
