import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'sup3r_s3cr3tk3y_for_auth3ntication',
      signOptions: { expiresIn: '15m' },
    }),
    TypeOrmModule.forFeature([RefreshToken]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
