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
  title: "Supplier",
})
namespace api.Supplier;

@tag("Supplier")
@route("/api/{version}/suppliers")
@useAuth(BearerAuth)
interface SupplierController {
  @post
  @doc("create supplier")
  @returnsDoc("supplier created successfully")
  create(...VersionParams, @body input: CreateInput):
    | DefaultSuccessResponse<CreateOutput, 201>
    | CreateNotFoundError
    | CreateConflictException
    | CreateValidationException;

  @put
  @doc("update supplier")
  @returnsDoc("supplier updated successfully")
  update(...VersionParams, ...UpdateParamsInput, @body input: UpdateInput):
    | DefaultSuccessResponse<UpdateOutput, 200>
    | UpdateNotFoundException
    | UpdateConflictException
    | UpdateValidationException;

  @get
  @doc("list supplier")
  @returnsDoc("supplier listed successfully")
  list(...VersionParams, ...ListQueryInput): DefaultSuccessResponse<ListOutput, 200>;

  @get
  @doc("get supplier by id")
  @returnsDoc("get supplier by id successfully")
  getById(...VersionParams, ...GetByIdParamsInput): DefaultSuccessResponse<
    GetByIdOutput,
    200
  > | GetByIdSupplierNotFoundException | GetByIdValidationException;

  @delete
  @doc("delete supplier")
  @returnsDoc("delete supplier successfully")
  delete(...VersionParams, ...DeleteParamsInput): DefaultSuccessResponse<
    DeleteOutput,
    200
  > | DeleteNotFoundException | DeleteValidationException;

  @put
  @doc("update supplier rating")
  @route("rating/{id}")
  @returnsDoc("supplier rating updated successfully")
  updateRating(...VersionParams, ...UpdateRatingParamsInput, @body input: UpdateRatingInput):
    | DefaultSuccessResponse<UpdateRatingOutput, 200>
    | UpdateNotFoundException
    | UpdateValidationException;
}
