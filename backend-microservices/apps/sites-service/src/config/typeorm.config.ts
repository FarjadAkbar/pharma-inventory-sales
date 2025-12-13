import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Site } from '../entities/site.entity';
import * as dotenv from 'dotenv';

// Load env vars for CLI usage
dotenv.config();

// Shared configuration function
function getTypeOrmOptions(configService?: ConfigService): DataSourceOptions {
  const isRuntime = !!configService;

  // Support both naming conventions: DATABASE_* and DATABASE_*
  const host = configService?.get<string>('DATABASE_HOST') || process.env.DATABASE_HOST;
  const port = configService?.get<number>('DATABASE_PORT') || (process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : undefined);
  const username = configService?.get<string>('DATABASE_USER') || process.env.DATABASE_USER;
  const password = configService?.get<string>('DATABASE_PASSWORD') || process.env.DATABASE_PASSWORD;
  const database = configService?.get<string>('DATABASE_NAME') || process.env.DATABASE_NAME;

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [Site],
    migrations: isRuntime ? [] : ['src/migrations/*.ts'],
    synchronize: false,
    logging: configService?.get<string>('NODE_ENV') === 'development' || process.env.NODE_ENV === 'development',
  };
}

// For NestJS runtime
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return getTypeOrmOptions(this.configService);
  }
}

// For TypeORM CLI (migrations)
export default new DataSource(getTypeOrmOptions());