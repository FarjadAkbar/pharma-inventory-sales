import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QAReleasesModule } from './qa-releases/qa-releases.module';
import { QADeviationsModule } from './qa-deviations/qa-deviations.module';
import { TypeOrmConfigService } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    QAReleasesModule,
    QADeviationsModule,
  ],
})
export class AppModule {}

