# Backend microservices

See **[docs/BOOTSTRAP.md](./docs/BOOTSTRAP.md)** for services, ports, per-DB migrations, seeding, health checks, and distribution workflow.

Quick checks:

```bash
pnpm --filter @repo/shared build
pnpm contract:sales
```

Audit / history migrations (universal pattern tables per service DB):

```bash
pnpm --filter sales-order-service migration:run
pnpm --filter shipment-service migration:run
```
