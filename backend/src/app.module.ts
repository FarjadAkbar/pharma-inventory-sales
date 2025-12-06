import { Module } from '@nestjs/common';

import { InfraModule } from '@/infra/module';
import { LoggerModule } from './infra/logger';
import { LibModule } from './libs/module';

/**
 * Shared Infrastructure Module
 * 
 * This module contains only shared infrastructure code that is used by:
 * - API Gateway
 * - All microservices
 * 
 * All business logic modules have been extracted to microservices.
 * This backend directory now serves as a shared codebase for:
 * - Core entities and use cases
 * - Infrastructure (database, cache, logger, secrets)
 * - Libraries (token, event, i18n)
 * - Utils
 */
@Module({
  imports: [
    InfraModule,
    LibModule,
    LoggerModule
  ],
  providers: []
})
export class AppModule {}
