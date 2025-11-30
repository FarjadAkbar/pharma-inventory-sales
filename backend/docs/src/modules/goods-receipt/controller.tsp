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
  title: "GoodsReceipt",
})
namespace api.GoodsReceipt;

@tag("GoodsReceipt")
@route("/api/{version}/goods-receipts")
@useAuth(BearerAuth)
interface GoodsReceiptController {
  @post
  @doc("create goods receipt")
  @returnsDoc("goods receipt created successfully")
  create(...VersionParams, @body input: CreateInput):
    | DefaultSuccessResponse<CreateOutput, 201>
    | CreateNotFoundError
    | CreateConflictException
    | CreateValidationException;

  @put
  @doc("update goods receipt")
  @returnsDoc("goods receipt updated successfully")
  update(...VersionParams, ...UpdateParamsInput, @body input: UpdateInput):
    | DefaultSuccessResponse<UpdateOutput, 200>
    | UpdateNotFoundException
    | UpdateConflictException
    | UpdateValidationException;

  @get
  @doc("list goods receipt")
  @returnsDoc("goods receipt listed successfully")
  list(...VersionParams, ...ListQueryInput): DefaultSuccessResponse<ListOutput, 200>;

  @get
  @doc("get goods receipt by id")
  @returnsDoc("get goods receipt by id successfully")
  getById(...VersionParams, ...GetByIdParamsInput): DefaultSuccessResponse<
    GetByIdOutput,
    200
  > | GetByIdGoodsReceiptNotFoundException | GetByIdValidationException;

  @delete
  @doc("delete goods receipt")
  @returnsDoc("delete goods receipt successfully")
  delete(...VersionParams, ...DeleteParamsInput): DefaultSuccessResponse<
    DeleteOutput,
    200
  > | DeleteNotFoundException | DeleteValidationException;
}
