import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from './permissions/permissions.module';
import { Permission } from './entities/permission.entity';
import { TypeOrmConfigService } from './config/typeorm.config'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    PermissionsModule,
  ],
})
export class AppModule {}

