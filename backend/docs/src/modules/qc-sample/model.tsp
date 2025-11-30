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

namespace api.QCSample;

@doc("qc sample base entity")
model QCSampleEntity {
  id: string;
  sampleNumber: string;
  sourceType: "GoodsReceipt" | "Batch";
  sourceId: string;
  materialId: string;
  status: "Pending" | "InProgress" | "Completed" | "Failed";
  priority: "Low" | "Medium" | "High";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// ## CREATE ## //
@doc("qc sample create input")
model CreateInput extends OmitProperties<QCSampleEntity, "id" | "createdAt" | "updatedAt" | "sampleNumber" | "status"> {}
@doc("qc sample created input")
model CreateOutput extends ApiCreatedOutput {}

// ## UPDATE ## //
@doc("qc sample update params input")
model UpdateParamsInput {
  @doc("qc sample id")
  @path
  id: string;
}
@doc("qc sample update input")
model UpdateInput extends OmitProperties<QCSampleEntity, "id" | "createdAt" | "updatedAt" | "sampleNumber"> {}
@doc("qc sample update output")
model UpdateOutput extends QCSampleEntity {}

// ## LIST ## //
@doc("qc sample list query input")
model ListQueryInput extends ApiPaginationInput {}
@doc("qc sample list output")
model ListOutput extends ApiPaginationOutput<QCSampleEntity> {}

// ## GET BY ID ## //
@doc("get qc sample by id params input")
model GetByIdParamsInput {
  @doc("qc sample id")
  @path
  id: string;
}
@doc("get qc sample by id output")
model GetByIdOutput extends QCSampleEntity {}

// ## DELETE ## //
@doc("qc sample delete params input")
model DeleteParamsInput {
  @doc("qc sample id")
  @path
  id: string;
}
@doc("qc sample delete output")
model DeleteOutput {
  deleted: boolean;
  deletedCount: float64;
}
