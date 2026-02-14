import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // Only wrap HTTP responses that aren't already wrapped
    if (context.getType() === 'http') {
        return next.handle().pipe(map(data => {
            // Check if already has data property or is a special response
            if (data && data.data) {
                return data;
            }
            return { data };
        }));
    }
    return next.handle();
  }
}
