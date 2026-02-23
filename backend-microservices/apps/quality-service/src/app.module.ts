import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/typeorm.config';
import { QCTestsModule } from './qc-tests/qc-tests.module';
import { QCSamplesModule } from './qc-samples/qc-samples.module';
import { QCResultsModule } from './qc-results/qc-results.module';
import { QAReleasesModule } from './qa-releases/qa-releases.module';
import { QADeviationsModule } from './qa-deviations/qa-deviations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    QCTestsModule,
    QCSamplesModule,
    QCResultsModule,
    QAReleasesModule,
    QADeviationsModule,
  ],
})
export class AppModule {}
