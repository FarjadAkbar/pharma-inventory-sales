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
  title: "RawMaterial",
})
namespace api.RawMaterial;

@tag("RawMaterial")
@route("/api/{version}/raw-materials")
@useAuth(BearerAuth)
interface RawMaterialController {
  @post
  @doc("create raw material")
  @returnsDoc("raw material created successfully")
  create(...VersionParams, @body input: CreateInput):
    | DefaultSuccessResponse<CreateOutput, 201>
    | CreateNotFoundError
    | CreateConflictException
    | CreateValidationException;

  @put
  @doc("update raw material")
  @returnsDoc("raw material updated successfully")
  update(...VersionParams, ...UpdateParamsInput, @body input: UpdateInput):
    | DefaultSuccessResponse<UpdateOutput, 200>
    | UpdateNotFoundException
    | UpdateConflictException
    | UpdateValidationException;

  @get
  @doc("list raw material")
  @returnsDoc("raw material listed successfully")
  list(...VersionParams, ...ListQueryInput): DefaultSuccessResponse<ListOutput, 200>;

  @get
  @doc("get raw material by id")
  @returnsDoc("get raw material by id successfully")
  getById(...VersionParams, ...GetByIdParamsInput): DefaultSuccessResponse<
    GetByIdOutput,
    200
  > | GetByIdRawMaterialNotFoundException | GetByIdValidationException;

  @delete
  @doc("delete raw material")
  @returnsDoc("delete raw material successfully")
  delete(...VersionParams, ...DeleteParamsInput): DefaultSuccessResponse<
    DeleteOutput,
    200
  > | DeleteNotFoundException | DeleteValidationException;
}
