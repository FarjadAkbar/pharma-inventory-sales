# Quality Services Consolidation Guide

## Overview
This guide documents the consolidation of QC and QA services into two unified services following the hybrid approach.

## Service Consolidation

### Before (5 Services)
- `qc-tests-service` (Port 3012)
- `qc-samples-service` (Port 3011)
- `qc-results-service` (Port 3013)
- `qa-releases-service` (Port 3014)
- `qa-deviations-service` (Port 3013 - conflict!)

### After (2 Services)
- `quality-control-service` (Port 3010) - Consolidates qc-tests, qc-samples, qc-results
- `quality-assurance-service` (Port 3011) - Consolidates qa-releases, qa-deviations

## Port Assignments

| Service | Port | Status |
|---------|------|--------|
| API Gateway | 8000 | ✅ Updated |
| User Service | 3001 | ✅ |
| Auth Service | 3002 | ✅ |
| Role Service | 3003 | ✅ |
| Permission Service | 3004 | ✅ |
| Site Service | 3005 | ✅ |
| Supplier Service | 3006 | ✅ |
| Raw Materials Service | 3007 | ✅ |
| Purchase Orders Service | 3008 | ✅ |
| Goods Receipts Service | 3009 | ✅ |
| **Quality Control Service** | **3010** | ✅ **NEW** |
| **Quality Assurance Service** | **3011** | ✅ **NEW** |
| Warehouse Service | 3014 | ✅ |

## API Gateway Changes

### Updated Service Clients
- ✅ Replaced `QC_SAMPLE_SERVICE`, `QC_TEST_SERVICE`, `QC_RESULT_SERVICE` with `QUALITY_CONTROL_SERVICE`
- ✅ Replaced `QA_RELEASE_SERVICE`, `QA_DEVIATION_SERVICE` with `QUALITY_ASSURANCE_SERVICE`

### Updated Controllers
- ✅ `QCSamplesController` → Uses `QUALITY_CONTROL_SERVICE`
- ✅ `QCTestsController` → Uses `QUALITY_CONTROL_SERVICE`
- ✅ `QCResultsController` → Uses `QUALITY_CONTROL_SERVICE`
- ✅ `QAReleasesController` → Uses `QUALITY_ASSURANCE_SERVICE`
- ✅ `QADeviationsController` → Uses `QUALITY_ASSURANCE_SERVICE`

## Next Steps: Creating Consolidated Services

### 1. Quality Control Service Structure

```
quality-control-service/
├── src/
│   ├── qc-tests/
│   │   ├── qc-tests.controller.ts
│   │   ├── qc-tests.service.ts
│   │   └── qc-tests.module.ts
│   ├── qc-samples/
│   │   ├── qc-samples.controller.ts
│   │   ├── qc-samples.service.ts
│   │   └── qc-samples.module.ts
│   ├── qc-results/
│   │   ├── qc-results.controller.ts
│   │   ├── qc-results.service.ts
│   │   └── qc-results.module.ts
│   ├── entities/
│   │   ├── qc-test.entity.ts
│   │   ├── qc-test-specification.entity.ts
│   │   ├── qc-sample.entity.ts
│   │   └── qc-result.entity.ts
│   ├── config/
│   │   └── typeorm.config.ts
│   ├── app.module.ts
│   └── main.ts
```

### 2. Quality Assurance Service Structure

```
quality-assurance-service/
├── src/
│   ├── qa-releases/
│   │   ├── qa-releases.controller.ts
│   │   ├── qa-releases.service.ts
│   │   └── qa-releases.module.ts
│   ├── qa-deviations/
│   │   ├── qa-deviations.controller.ts
│   │   ├── qa-deviations.service.ts
│   │   └── qa-deviations.module.ts
│   ├── entities/
│   │   ├── qa-release.entity.ts
│   │   ├── qa-checklist-item.entity.ts
│   │   └── qa-deviation.entity.ts
│   ├── config/
│   │   └── typeorm.config.ts
│   ├── app.module.ts
│   └── main.ts
```

## Key Changes Required

### Internal Service Communication

**Before (Microservice calls):**
```typescript
// qc-results.service.ts
@Inject('QC_SAMPLE_SERVICE')
private qcSampleClient: ClientProxy

// qc-samples.service.ts
@Inject('QC_TEST_SERVICE')
private qcTestClient: ClientProxy
```

**After (Direct injection):**
```typescript
// In quality-control-service
// qc-results.service.ts
constructor(
  @InjectRepository(QCSample)
  private qcSamplesRepository: Repository<QCSample>,
  @InjectRepository(QCTest)
  private qcTestsRepository: Repository<QCTest>,
  // ... no microservice client needed
)
```

### Module Updates

**Quality Control Service - app.module.ts:**
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    QCTestsModule,
    QCSamplesModule,
    QCResultsModule,
    // External services only
    ClientsModule.register([
      {
        name: 'GOODS_RECEIPT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GOODS_RECEIPT_SERVICE_HOST,
          port: parseInt(process.env.GOODS_RECEIPT_SERVICE_PORT || '3009'),
        },
      },
    ]),
  ],
})
```

**Quality Assurance Service - app.module.ts:**
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    QAReleasesModule,
    QADeviationsModule,
    // External services
    ClientsModule.register([
      {
        name: 'QUALITY_CONTROL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.QUALITY_CONTROL_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.QUALITY_CONTROL_SERVICE_PORT || '3010'),
        },
      },
      {
        name: 'GOODS_RECEIPT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GOODS_RECEIPT_SERVICE_HOST,
          port: parseInt(process.env.GOODS_RECEIPT_SERVICE_PORT || '3009'),
        },
      },
      {
        name: 'WAREHOUSE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.WAREHOUSE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.WAREHOUSE_SERVICE_PORT || '3014'),
        },
      },
    ]),
  ],
})
```

### Service Module Updates

**qc-samples.module.ts (in quality-control-service):**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([QCSample]),
    // Remove QC_TEST_SERVICE client - use direct injection instead
    ClientsModule.register([
      {
        name: 'GOODS_RECEIPT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GOODS_RECEIPT_SERVICE_HOST,
          port: parseInt(process.env.GOODS_RECEIPT_SERVICE_PORT || '3009'),
        },
      },
    ]),
  ],
  controllers: [QCSamplesController],
  providers: [QCSamplesService],
  exports: [QCSamplesService], // Export for internal use
})
```

**qc-results.module.ts (in quality-control-service):**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([QCResult]),
    // Import QCTestsModule and QCSamplesModule for direct access
    QCTestsModule,
    QCSamplesModule,
  ],
  controllers: [QCResultsController],
  providers: [QCResultsService],
})
```

## Database Configuration

### Quality Control DB
- Database: `quality_control_db`
- Contains: qc_tests, qc_test_specifications, qc_samples, qc_results

### Quality Assurance DB
- Database: `quality_assurance_db`
- Contains: qa_releases, qa_checklist_items, qa_deviations

## Migration Steps

1. ✅ Updated API Gateway to use consolidated services
2. ⏳ Create quality-control-service structure
3. ⏳ Create quality-assurance-service structure
4. ⏳ Update internal service communication (remove microservice calls)
5. ⏳ Update database configurations
6. ⏳ Run migrations for consolidated databases
7. ⏳ Test service communication

## Benefits

1. **Reduced Complexity**: 5 services → 2 services
2. **Better Performance**: Internal calls use direct injection instead of TCP
3. **Easier Transactions**: Can use database transactions across related entities
4. **Simpler Deployment**: Fewer services to manage
5. **Clear Boundaries**: QC (testing) vs QA (review/approval)

