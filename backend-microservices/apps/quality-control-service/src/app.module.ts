import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QCTestsModule } from './qc-tests/qc-tests.module';
import { QCSamplesModule } from './qc-samples/qc-samples.module';
import { QCResultsModule } from './qc-results/qc-results.module';
import { TypeOrmConfigService } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    QCTestsModule,
    QCSamplesModule,
    QCResultsModule,
  ],
})
export class AppModule {}

