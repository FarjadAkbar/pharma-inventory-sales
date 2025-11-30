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
  title: "QCTest",
})
namespace api.QCTest;

@tag("QCTest")
@route("/api/{version}/qc-tests")
@useAuth(BearerAuth)
interface QCTestController {
  @post
  @doc("create qc test")
  @returnsDoc("qc test created successfully")
  create(...VersionParams, @body input: CreateInput):
    | DefaultSuccessResponse<CreateOutput, 201>
    | CreateNotFoundError
    | CreateConflictException
    | CreateValidationException;

  @put
  @doc("update qc test")
  @returnsDoc("qc test updated successfully")
  update(...VersionParams, ...UpdateParamsInput, @body input: UpdateInput):
    | DefaultSuccessResponse<UpdateOutput, 200>
    | UpdateNotFoundException
    | UpdateConflictException
    | UpdateValidationException;

  @get
  @doc("list qc test")
  @returnsDoc("qc test listed successfully")
  list(...VersionParams, ...ListQueryInput): DefaultSuccessResponse<ListOutput, 200>;

  @get
  @doc("get qc test by id")
  @returnsDoc("get qc test by id successfully")
  getById(...VersionParams, ...GetByIdParamsInput): DefaultSuccessResponse<
    GetByIdOutput,
    200
  > | GetByIdQcTestNotFoundException | GetByIdValidationException;

  @delete
  @doc("delete qc test")
  @returnsDoc("delete qc test successfully")
  delete(...VersionParams, ...DeleteParamsInput): DefaultSuccessResponse<
    DeleteOutput,
    200
  > | DeleteNotFoundException | DeleteValidationException;
}
