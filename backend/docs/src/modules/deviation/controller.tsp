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
  title: "Deviation",
})
namespace api.Deviation;

@tag("Deviation")
@route("/api/{version}/deviations")
@useAuth(BearerAuth)
interface DeviationController {
  @post
  @doc("create deviation")
  @returnsDoc("deviation created successfully")
  create(...VersionParams, @body input: CreateInput):
    | DefaultSuccessResponse<CreateOutput, 201>
    | CreateNotFoundError
    | CreateConflictException
    | CreateValidationException;

  @put
  @doc("update deviation")
  @returnsDoc("deviation updated successfully")
  update(...VersionParams, ...UpdateParamsInput, @body input: UpdateInput):
    | DefaultSuccessResponse<UpdateOutput, 200>
    | UpdateNotFoundException
    | UpdateConflictException
    | UpdateValidationException;

  @get
  @doc("list deviation")
  @returnsDoc("deviation listed successfully")
  list(...VersionParams, ...ListQueryInput): DefaultSuccessResponse<ListOutput, 200>;

  @get
  @doc("get deviation by id")
  @returnsDoc("get deviation by id successfully")
  getById(...VersionParams, ...GetByIdParamsInput): DefaultSuccessResponse<
    GetByIdOutput,
    200
  > | GetByIdDeviationNotFoundException | GetByIdValidationException;

  @delete
  @doc("delete deviation")
  @returnsDoc("delete deviation successfully")
  delete(...VersionParams, ...DeleteParamsInput): DefaultSuccessResponse<
    DeleteOutput,
    200
  > | DeleteNotFoundException | DeleteValidationException;
}

