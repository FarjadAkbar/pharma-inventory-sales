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

namespace api.QCTest;

@doc("qc test base entity")
model QCTestEntity {
  id: string;
  name: string;
  description: string;
  materialType: string;
  specifications: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null = null;
}

// ## CREATE ## //
@doc("qc test create input")
model CreateInput extends OmitProperties<QCTestEntity, "id" | "createdAt" | "updatedAt" | "deletedAt"> {}
@doc("qc test created input")
model CreateOutput extends ApiCreatedOutput {}

// ## UPDATE ## //
@doc("qc test update params input")
model UpdateParamsInput {
  @doc("qc test id")
  @path
  id: string;
}
@doc("qc test update input")
model UpdateInput extends OmitProperties<QCTestEntity, "id" | "createdAt" | "updatedAt" | "deletedAt"> {}
@doc("qc test update output")
model UpdateOutput extends QCTestEntity {}

// ## LIST ## //
@doc("qc test list query input")
model ListQueryInput extends ApiPaginationInput {}
@doc("qc test list output")
model ListOutput extends ApiPaginationOutput<QCTestEntity> {}

// ## GET BY ID ## //
@doc("get qc test by id params input")
model GetByIdParamsInput {
  @doc("qc test id")
  @path
  id: string;
}
@doc("get qc test by id output")
model GetByIdOutput extends QCTestEntity {}

// ## DELETE ## //
@doc("qc test delete params input")
model DeleteParamsInput {
  @doc("qc test id")
  @path
  id: string;
}
@doc("qc test delete output")
model DeleteOutput extends OmitProperties<QCTestEntity, "deletedAt"> {
  deletedAt: utcDateTime;
}
