import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    console.log('[JWT Guard] Guard initialized and ready');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();
    
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      controller,
    ]);
    
    console.log(`[JWT Guard] ${request.method} ${request.url} - Public: ${isPublic}`);
    
    if (isPublic) {
      return true;
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.log(`[JWT Guard] BLOCKED: No token for ${request.method} ${request.url}`);
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'No token provided',
        error: 'Unauthorized'
      });
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production';
      const payload = this.jwtService.verify(token, { secret });
      
      // Attach user info to request for use in controllers
      request.user = payload;
      console.log(`[JWT Guard] ALLOWED: Valid token for ${request.method} ${request.url}`);
      return true;
    } catch (error) {
      console.log(`[JWT Guard] BLOCKED: Invalid token for ${request.method} ${request.url} - ${error.message}`);
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid or expired token',
        error: 'Unauthorized'
      });
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
