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

namespace api.QCResult;

@doc("qc result base entity")
model QCResultEntity {
  id: string;
  sampleId: string;
  testId: string;
  resultValue: string;
  passed: boolean;
  testedBy: string;
  testedAt: utcDateTime;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// ## CREATE ## //
@doc("qc result create input")
model CreateInput extends OmitProperties<QCResultEntity, "id" | "createdAt" | "updatedAt"> {}
@doc("qc result created input")
model CreateOutput extends ApiCreatedOutput {}

// ## UPDATE ## //
@doc("qc result update params input")
model UpdateParamsInput {
  @doc("qc result id")
  @path
  id: string;
}
@doc("qc result update input")
model UpdateInput extends OmitProperties<QCResultEntity, "id" | "createdAt" | "updatedAt"> {}
@doc("qc result update output")
model UpdateOutput extends QCResultEntity {}

// ## LIST ## //
@doc("qc result list query input")
model ListQueryInput extends ApiPaginationInput {}
@doc("qc result list output")
model ListOutput extends ApiPaginationOutput<QCResultEntity> {}

// ## GET BY ID ## //
@doc("get qc result by id params input")
model GetByIdParamsInput {
  @doc("qc result id")
  @path
  id: string;
}
@doc("get qc result by id output")
model GetByIdOutput extends QCResultEntity {}

// ## DELETE ## //
@doc("qc result delete params input")
model DeleteParamsInput {
  @doc("qc result id")
  @path
  id: string;
}
@doc("qc result delete output")
model DeleteOutput {
  deleted: boolean;
  deletedCount: float64;
}
