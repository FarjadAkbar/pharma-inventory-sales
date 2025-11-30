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

namespace api.QARelease;

@doc("qa release base entity")
model QAReleaseEntity {
  id: string;
  entityType: "GoodsReceipt" | "Batch";
  entityId: string;
  decision: "Release" | "Reject" | "Hold";
  qcSampleId?: string;
  remarks: string;
  releasedBy: string;
  releasedAt: utcDateTime;
  createdAt: string;
  updatedAt: string;
}

// ## CREATE ## //
@doc("qa release create input")
model CreateInput extends OmitProperties<QAReleaseEntity, "id" | "createdAt" | "updatedAt"> {}
@doc("qa release created input")
model CreateOutput extends ApiCreatedOutput {}

// ## UPDATE ## //
@doc("qa release update params input")
model UpdateParamsInput {
  @doc("qa release id")
  @path
  id: string;
}
@doc("qa release update input")
model UpdateInput extends OmitProperties<QAReleaseEntity, "id" | "createdAt" | "updatedAt"> {}
@doc("qa release update output")
model UpdateOutput extends QAReleaseEntity {}

// ## LIST ## //
@doc("qa release list query input")
model ListQueryInput extends ApiPaginationInput {}
@doc("qa release list output")
model ListOutput extends ApiPaginationOutput<QAReleaseEntity> {}

// ## GET BY ID ## //
@doc("get qa release by id params input")
model GetByIdParamsInput {
  @doc("qa release id")
  @path
  id: string;
}
@doc("get qa release by id output")
model GetByIdOutput extends QAReleaseEntity {}

// ## DELETE ## //
@doc("qa release delete params input")
model DeleteParamsInput {
  @doc("qa release id")
  @path
  id: string;
}
@doc("qa release delete output")
model DeleteOutput {
  deleted: boolean;
  deletedCount: float64;
}
