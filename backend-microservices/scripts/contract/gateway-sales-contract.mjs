#!/usr/bin/env node
/**
 * Static contract checks for API gateway sales endpoints (no server required).
 * Extend fixtures when microservices return new shapes.
 */

import assert from 'node:assert';

function assertSalesOrdersListEnvelope(body) {
  assert.strictEqual(body.success, true, 'list: success must be true');
  assert.ok(body.data != null, 'list: data required');
  const d = body.data;
  const rows = Array.isArray(d.data)
    ? d.data
    : Array.isArray(d.salesOrders)
      ? d.salesOrders
      : Array.isArray(d)
        ? d
        : null;
  assert.ok(Array.isArray(rows), 'list: data.data | data.salesOrders | array required');
}

function assertShipmentCreateResponse(body) {
  assert.strictEqual(body.success, true, 'create shipment: success');
  assert.ok(body.data != null, 'create shipment: data');
  const s = body.data.data ?? body.data;
  assert.ok(s && typeof s.id === 'number', 'create shipment: data.id number');
}

// Fixture: gateway wraps microservice list result as { success, data: result }
assertSalesOrdersListEnvelope({
  success: true,
  data: { data: [], total: 0, page: 1, limit: 10 },
});

assertSalesOrdersListEnvelope({
  success: true,
  data: { salesOrders: [], pagination: { page: 1, pages: 1, total: 0 } },
});

assertShipmentCreateResponse({
  success: true,
  data: { id: 1, shipmentNumber: 'SH-2025-000001', items: [] },
});

console.log('gateway-sales-contract: OK');
