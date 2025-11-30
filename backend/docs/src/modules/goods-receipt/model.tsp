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

namespace api.GoodsReceipt;

@doc("goods receipt item entity")
model GoodsReceiptItemEntity {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId: string;
  receivedQuantity: float64;
  acceptedQuantity: float64;
  rejectedQuantity: float64;
  batchNumber?: string;
  expiryDate?: utcDateTime;
  createdAt: string;
  updatedAt: string;
}

@doc("goods receipt base entity")
model GoodsReceiptEntity {
  id: string;
  grnNumber: string;
  purchaseOrderId: string;
  receivedDate: utcDateTime;
  status: "Draft" | "Verified" | "Completed";
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null = null;
  items?: GoodsReceiptItemEntity[];
}

// ## CREATE ## //
@doc("goods receipt item create input")
model GoodsReceiptItemCreateInput {
  purchaseOrderItemId: string;
  receivedQuantity: float64;
  acceptedQuantity: float64;
  rejectedQuantity: float64;
  batchNumber?: string;
  expiryDate?: utcDateTime;
}

@doc("goods receipt create input")
model CreateInput {
  purchaseOrderId: string;
  receivedDate: utcDateTime;
  remarks?: string;
  items: GoodsReceiptItemCreateInput[];
}

@doc("goods receipt created input")
model CreateOutput extends ApiCreatedOutput {}

// ## UPDATE ## //
@doc("goods receipt update params input")
model UpdateParamsInput {
  @doc("goods receipt id")
  @path
  id: string;
}
@doc("goods receipt update input")
model UpdateInput extends OmitProperties<GoodsReceiptEntity, "id" | "grnNumber" | "createdAt" | "updatedAt" | "deletedAt" | "items"> {
  items?: GoodsReceiptItemCreateInput[];
}
@doc("goods receipt update output")
model UpdateOutput extends GoodsReceiptEntity {}

// ## LIST ## //
@doc("goods receipt list query input")
model ListQueryInput extends ApiPaginationInput {}
@doc("goods receipt list output")
model ListOutput extends ApiPaginationOutput<GoodsReceiptEntity> {}

// ## GET BY ID ## //
@doc("get goods receipt by id params input")
model GetByIdParamsInput {
  @doc("goods receipt id")
  @path
  id: string;
}
@doc("get goods receipt by id output")
model GetByIdOutput extends GoodsReceiptEntity {}

// ## DELETE ## //
@doc("goods receipt delete params input")
model DeleteParamsInput {
  @doc("goods receipt id")
  @path
  id: string;
}
@doc("goods receipt delete output")
model DeleteOutput extends OmitProperties<GoodsReceiptEntity, "deletedAt"> {
  deletedAt: utcDateTime;
}
