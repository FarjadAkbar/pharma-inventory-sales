import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QCTestsController } from './qc-tests.controller';
import { QCTestsService } from './qc-tests.service';
import { QCTest } from '../entities/qc-test.entity';
import { QCTestSpecification } from '../entities/qc-test-specification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QCTest, QCTestSpecification]),
  ],
  controllers: [QCTestsController],
  providers: [QCTestsService],
})
export class QCTestsModule {}

