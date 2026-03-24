# Backend bootstrap & operations

## Topology

| Component | Typical port | Role |
|-----------|-------------|------|
| **api-gateway** | 8000 | HTTP API, JWT, routes to TCP microservices |
| **identity-service** | 3001 | Users / auth |
| **master-data-service** | 3002 | Drugs, sites, etc. |
| **quality-service** | 3003 | QC |
| **procurement-service** | 3004 / 3011 | PO / suppliers (see `.env`) |
| **warehouse-service** | 3005 | Inventory |
| **manufacturing-service** | 3006 | BOM, work orders, batches |
| **sales-order-service** | 3007 | Sales orders (canonical SO lines) |
| **shipment-service** | 3008 | Shipments & items (snapshots SO at create) |
| **sales-crm-service** | (see app) | CRM |
| **seeder** | N/A | Idempotent-ish reference data (run after migrations) |

Copy each app’s `.env.example` → `.env` and set `DATABASE_URL` / hosts so **each service uses its own database** where designed.

## Migrations (per service)

Run from repo root `backend-microservices` with pnpm, **per app that owns the schema**:

```bash
pnpm --filter identity-service migration:run
pnpm --filter master-data-service migration:run
pnpm --filter sales-order-service migration:run
pnpm --filter shipment-service migration:run
# …repeat for warehouse, manufacturing, procurement, quality, etc.
```

If you see `relation "shipments" does not exist`, the **shipment-service** migrations have not been applied to that service’s DB.

## Seeding

```bash
pnpm seed
```

Requires `@repo/shared` built and DBs migrated. Re-running may duplicate rows unless seeder scripts are written to upsert—treat as **dev bootstrap** unless documented otherwise.

## Health checks

- **Gateway**: `GET /v1/health` — pings identity, sales-order, and shipment TCP services (see `api-gateway` `HealthController`). Ensure env host/port match `app.module` client config.

## Distribution workflow (enforced server-side)

1. Sales order in **sales-order-service** reaches **Approved**.
2. `POST /sales/shipments` with **logistics only** (`salesOrderId`, dates, carrier, serviceType, optional priority/remarks). Gateway sets `createdBy` from JWT.
3. **shipment-service** loads the SO via microservice call and snapshots customer, site, address, and **all lines** (quantities must match SO; optional client lines are validated, not trusted for mismatches).
4. Open shipment in UI: **allocate → pick → pack → ship**; gateway injects `allocatedBy` / `pickedBy` / `packedBy` / `shippedBy` from JWT.

## Frontend conventions

- **Batches**: prefer creating from a work order: `/dashboard/manufacturing/batches/new?workOrderId=<id>`.
- **Shipments**: primary path is **Shipments** → shipment detail; “Line items (all shipments)” is an aggregate view.

## Contract checks

Run:

```bash
pnpm contract:sales
```

Validates documented JSON shapes for gateway sales list responses (see `scripts/contract/gateway-sales-contract.mjs`). Extend this file when adding new response variants.

## Audit & versioning

- Mutating sales/shipment actions attach the authenticated user id at the **gateway** from JWT (`sub` / `id`).
- Full **audit tables** and **optimistic locking (`version`)** are not in this pass; add per-entity migrations if required for compliance.
