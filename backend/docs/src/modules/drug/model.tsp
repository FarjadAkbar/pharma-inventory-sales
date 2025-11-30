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

namespace api.Drug;

@doc("drug base entity")
model DrugEntity {
  id: string;
  code: string;
  name: string;
  formula: string;
  strength: string;
  dosageForm: string;
  route: string;
  description: string;
  approvalStatus: "Draft" | "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null = null;
}

// ## CREATE ## //
@doc("drug create input")
model CreateInput extends OmitProperties<DrugEntity, "id" | "createdAt" | "updatedAt" | "deletedAt"> {}
@doc("drug created input")
model CreateOutput extends ApiCreatedOutput {}

// ## UPDATE ## //
@doc("drug update params input")
model UpdateParamsInput {
  @doc("drug id")
  @path
  id: string;
}
@doc("drug update input")
model UpdateInput extends OmitProperties<DrugEntity, "id" | "createdAt" | "updatedAt" | "deletedAt"> {}
@doc("drug update output")
model UpdateOutput extends DrugEntity {}

// ## LIST ## //
@doc("drug list query input")
model ListQueryInput extends ApiPaginationInput {}
@doc("drug list output")
model ListOutput extends ApiPaginationOutput<DrugEntity> {}

// ## GET BY ID ## //
@doc("get drug by id params input")
model GetByIdParamsInput {
  @doc("drug id")
  @path
  id: string;
}
@doc("get drug by id output")
model GetByIdOutput extends DrugEntity {}

// ## DELETE ## //
@doc("drug delete params input")
model DeleteParamsInput {
  @doc("drug id")
  @path
  id: string;
}
@doc("drug delete output")
model DeleteOutput extends OmitProperties<DrugEntity, "deletedAt"> {
  deletedAt: utcDateTime;
}

// ## APPROVE ## //
@doc("drug approve params input")
model ApproveParamsInput {
  @doc("drug id")
  @path
  id: string;
}
@doc("drug approve output")
model ApproveOutput extends DrugEntity {}

// ## REJECT ## //
@doc("drug reject params input")
model RejectParamsInput {
  @doc("drug id")
  @path
  id: string;
}
@doc("drug reject output")
model RejectOutput extends DrugEntity {}
