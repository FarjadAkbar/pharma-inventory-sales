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

namespace api.RawMaterial;

@doc("raw material base entity")
model RawMaterialEntity {
  id: string;
  code: string;
  name: string;
  grade: string;
  unitOfMeasure: string;
  supplierId: string;
  storageRequirements: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null = null;
}

// ## CREATE ## //
@doc("raw material create input")
model CreateInput extends OmitProperties<RawMaterialEntity, "id" | "createdAt" | "updatedAt" | "deletedAt"> {}
@doc("raw material created input")
model CreateOutput extends ApiCreatedOutput {}

// ## UPDATE ## //
@doc("raw material update params input")
model UpdateParamsInput {
  @doc("raw material id")
  @path
  id: string;
}
@doc("raw material update input")
model UpdateInput extends OmitProperties<RawMaterialEntity, "id" | "createdAt" | "updatedAt" | "deletedAt"> {}
@doc("raw material update output")
model UpdateOutput extends RawMaterialEntity {}

// ## LIST ## //
@doc("raw material list query input")
model ListQueryInput extends ApiPaginationInput {}
@doc("raw material list output")
model ListOutput extends ApiPaginationOutput<RawMaterialEntity> {}

// ## GET BY ID ## //
@doc("get raw material by id params input")
model GetByIdParamsInput {
  @doc("raw material id")
  @path
  id: string;
}
@doc("get raw material by id output")
model GetByIdOutput extends RawMaterialEntity {}

// ## DELETE ## //
@doc("raw material delete params input")
model DeleteParamsInput {
  @doc("raw material id")
  @path
  id: string;
}
@doc("raw material delete output")
model DeleteOutput extends OmitProperties<RawMaterialEntity, "deletedAt"> {
  deletedAt: utcDateTime;
}
