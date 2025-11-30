import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";
import "@typespec/versioning";
import "../../utils/exceptions.tsp";
import "../../utils/versioning.tsp";
import "../../utils/model.tsp";
import "./model.tsp";
import "./exception.tsp";

using api.Utils.Model;
using TypeSpec.Http;
using TypeSpec.Versioning;
using OpenAPI;
using Utils.Versioning;
using Utils.Exception;

@service({
  title: "Drug",
})
namespace api.Drug;

@tag("Drug")
@route("/api/{version}/drugs")
@useAuth(BearerAuth)
interface DrugController {
  @post
  @doc("create drug")
  @returnsDoc("drug created successfully")
  create(...VersionParams, @body input: CreateInput):
    | DefaultSuccessResponse<CreateOutput, 201>
    | CreateNotFoundError
    | CreateConflictException
    | CreateValidationException;

  @put
  @doc("update drug")
  @returnsDoc("drug updated successfully")
  update(...VersionParams, ...UpdateParamsInput, @body input: UpdateInput):
    | DefaultSuccessResponse<UpdateOutput, 200>
    | UpdateNotFoundException
    | UpdateConflictException
    | UpdateValidationException;

  @get
  @doc("list drug")
  @returnsDoc("drug listed successfully")
  list(...VersionParams, ...ListQueryInput): DefaultSuccessResponse<ListOutput, 200>;

  @get
  @doc("get drug by id")
  @returnsDoc("get drug by id successfully")
  getById(...VersionParams, ...GetByIdParamsInput): DefaultSuccessResponse<
    GetByIdOutput,
    200
  > | GetByIdDrugNotFoundException | GetByIdValidationException;

  @delete
  @doc("delete drug")
  @returnsDoc("delete drug successfully")
  delete(...VersionParams, ...DeleteParamsInput): DefaultSuccessResponse<
    DeleteOutput,
    200
  > | DeleteNotFoundException | DeleteValidationException;

  @put
  @doc("approve drug")
  @route("approve/{id}")
  @returnsDoc("drug approved successfully")
  approve(...VersionParams, ...ApproveParamsInput):
    | DefaultSuccessResponse<ApproveOutput, 200>
    | UpdateNotFoundException
    | UpdateValidationException;

  @put
  @doc("reject drug")
  @route("reject/{id}")
  @returnsDoc("drug rejected successfully")
  reject(...VersionParams, ...RejectParamsInput):
    | DefaultSuccessResponse<RejectOutput, 200>
    | UpdateNotFoundException
    | UpdateValidationException;
}
