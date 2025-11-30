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

namespace api.Supplier;

@doc("supplier base entity")
model SupplierEntity {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: float64;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null = null;
}

// ## CREATE ## //
@doc("supplier create input")
model CreateInput extends OmitProperties<SupplierEntity, "id" | "createdAt" | "updatedAt" | "deletedAt"> {}
@doc("supplier created input")
model CreateOutput extends ApiCreatedOutput {}

// ## UPDATE ## //
@doc("supplier update params input")
model UpdateParamsInput {
  @doc("supplier id")
  @path
  id: string;
}
@doc("supplier update input")
model UpdateInput extends OmitProperties<SupplierEntity, "id" | "createdAt" | "updatedAt" | "deletedAt"> {}
@doc("supplier update output")
model UpdateOutput extends SupplierEntity {}

// ## LIST ## //
@doc("supplier list query input")
model ListQueryInput extends ApiPaginationInput {}
@doc("supplier list output")
model ListOutput extends ApiPaginationOutput<SupplierEntity> {}

// ## GET BY ID ## //
@doc("get supplier by id params input")
model GetByIdParamsInput {
  @doc("supplier id")
  @path
  id: string;
}
@doc("get supplier by id output")
model GetByIdOutput extends SupplierEntity {}

// ## DELETE ## //
@doc("supplier delete params input")
model DeleteParamsInput {
  @doc("supplier id")
  @path
  id: string;
}
@doc("supplier delete output")
model DeleteOutput extends OmitProperties<SupplierEntity, "deletedAt"> {
  deletedAt: utcDateTime;
}

// ## UPDATE RATING ## //
@doc("supplier update rating params input")
model UpdateRatingParamsInput {
  @doc("supplier id")
  @path
  id: string;
}
@doc("supplier update rating input")
model UpdateRatingInput {
  rating: float64;
}
@doc("supplier update rating output")
model UpdateRatingOutput extends SupplierEntity {}
