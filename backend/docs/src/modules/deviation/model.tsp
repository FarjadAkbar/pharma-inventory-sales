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

namespace api.Deviation;

@doc("deviation base entity")
model DeviationEntity {
  id: string;
  deviationNumber: string;
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "Investigating" | "Resolved" | "Closed";
  rootCause?: string;
  correctiveActions: string;
  createdAt: string;
  updatedAt: string;
}

// ## CREATE ## //
@doc("deviation create input")
model CreateInput extends OmitProperties<DeviationEntity, "id" | "createdAt" | "updatedAt" | "deviationNumber"> {}
@doc("deviation created input")
model CreateOutput extends ApiCreatedOutput {}

// ## UPDATE ## //
@doc("deviation update params input")
model UpdateParamsInput {
  @doc("deviation id")
  @path
  id: string;
}
@doc("deviation update input")
model UpdateInput extends OmitProperties<DeviationEntity, "id" | "createdAt" | "updatedAt" | "deviationNumber"> {}
@doc("deviation update output")
model UpdateOutput extends DeviationEntity {}

// ## LIST ## //
@doc("deviation list query input")
model ListQueryInput extends ApiPaginationInput {}
@doc("deviation list output")
model ListOutput extends ApiPaginationOutput<DeviationEntity> {}

// ## GET BY ID ## //
@doc("get deviation by id params input")
model GetByIdParamsInput {
  @doc("deviation id")
  @path
  id: string;
}
@doc("get deviation by id output")
model GetByIdOutput extends DeviationEntity {}

// ## DELETE ## //
@doc("deviation delete params input")
model DeleteParamsInput {
  @doc("deviation id")
  @path
  id: string;
}
@doc("deviation delete output")
model DeleteOutput {
  deleted: boolean;
  deletedCount: float64;
}
