import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const type = context.getType();
    
    if (type === 'http') {
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const url = req.url;
        
        return next
        .handle()
        .pipe(
            tap(() => this.logger.log(`${method} ${url} ${Date.now() - now}ms`)),
        );
    } else {
        // RPC or other
        return next
        .handle()
        .pipe(
            tap(() => this.logger.log(`RPC Execution Time: ${Date.now() - now}ms`)),
        );
    }
  }
}
