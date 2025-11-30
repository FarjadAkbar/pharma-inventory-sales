import "@typespec/http";
import "@typespec/versioning";
import "@typespec/openapi3";
import "../../utils/exceptions.tsp";
import "../../utils/model.tsp";
import "../../utils/versioning.tsp";

using TypeSpec.Http;
using TypeSpec.Versioning;

using Utils.Model;
using Utils.Versioning;

namespace api.PurchaseOrder;

@doc("purchase order item entity")
model PurchaseOrderItemEntity {
  id: string;
  purchaseOrderId: string;
  materialId: string;
  quantity: float64;
  unitPrice: float64;
  totalPrice: float64;
  createdAt: string;
  updatedAt: string;
}

@doc("purchase order base entity")
model PurchaseOrderEntity {
  id: string;
  poNumber: string;
  supplierId: string;
  siteId?: string;
  expectedDate: utcDateTime;
  status: "Draft" | "Pending" | "Approved" | "Received" | "Cancelled";
  totalAmount: float64;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null = null;
  items?: PurchaseOrderItemEntity[];
}

// ## CREATE ## //
@doc("purchase order item create input")
model PurchaseOrderItemCreateInput {
  materialId: string;
  quantity: float64;
  unitPrice: float64;
}

@doc("purchase order create input")
model CreateInput {
  supplierId: string;
  siteId?: string;
  expectedDate: utcDateTime;
  items: PurchaseOrderItemCreateInput[];
}

@doc("purchase order created input")
model CreateOutput extends ApiCreatedOutput {}

// ## UPDATE ## //
@doc("purchase order update params input")
model UpdateParamsInput {
  @doc("purchase order id")
  @path
  id: string;
}
@doc("purchase order update input")
model UpdateInput extends OmitProperties<PurchaseOrderEntity, "id" | "poNumber" | "totalAmount" | "createdAt" | "updatedAt" | "deletedAt" | "items"> {
  items?: PurchaseOrderItemCreateInput[];
}
@doc("purchase order update output")
model UpdateOutput extends PurchaseOrderEntity {}

// ## LIST ## //
@doc("purchase order list query input")
model ListQueryInput extends ApiPaginationInput {}
@doc("purchase order list output")
model ListOutput extends ApiPaginationOutput<PurchaseOrderEntity> {}

// ## GET BY ID ## //
@doc("get purchase order by id params input")
model GetByIdParamsInput {
  @doc("purchase order id")
  @path
  id: string;
}
@doc("get purchase order by id output")
model GetByIdOutput extends PurchaseOrderEntity {}

// ## DELETE ## //
@doc("purchase order delete params input")
model DeleteParamsInput {
  @doc("purchase order id")
  @path
  id: string;
}
@doc("purchase order delete output")
model DeleteOutput extends OmitProperties<PurchaseOrderEntity, "deletedAt"> {
  deletedAt: utcDateTime;
}
