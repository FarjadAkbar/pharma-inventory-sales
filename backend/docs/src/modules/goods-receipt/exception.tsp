import "@typespec/http";
import "../../utils/exceptions.tsp";

using TypeSpec.Http;
using api.Utils.Exception;

namespace api.GoodsReceipt;

// ## CREATE ## //
@doc("When goodsReceipt not found")
@error
model CreateNotFoundError extends ApiNotFoundException<"goodsReceiptNotFound"> {
  @statusCode statusCode: 404;
}

alias CreateNotFoundException = CreateNotFoundError;

@doc("When input body is invalid")
@error
model CreateBodyValidationError
  extends ApiBadRequestException<"description: Required, type: Required"> {
  @statusCode statusCode: 400;
}

alias CreateValidationException = CreateBodyValidationError;

@doc("When goodsReceipt already exists")
@error
model CreateExistConflictError extends ApiConflictException<"goodsReceiptExists"> {
  @statusCode statusCode: 409;
}

alias CreateConflictException = CreateExistConflictError;

// ## UPDATE ## //
@doc("When goodsReceipt not found")
@error
model UpdateGoodsReceiptNotFoundError extends ApiNotFoundException<"goodsReceiptNotFound"> {
  @statusCode statusCode: 404;
}

alias UpdateNotFoundException = UpdateGoodsReceiptNotFoundError;

@doc("When input params is invalid")
@error
model UpdateParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias UpdateValidationException = UpdateParamsValidationError;

@doc("When goodsReceipt already exists")
@error
model UpdateExistConflictError extends ApiConflictException<"goodsReceiptExists"> {
  @statusCode statusCode: 409;
}

alias UpdateConflictException = UpdateExistConflictError;

// ## GET BY ID ## //
@doc("When goodsReceipt not found")
@error
model GetByIdGoodsReceiptNotFoundError extends ApiNotFoundException<"goodsReceiptNotFound"> {
  @statusCode statusCode: 404;
}

alias GetByIdGoodsReceiptNotFoundException = GetByIdGoodsReceiptNotFoundError;

@doc("When input params is invalid")
@error
model GetByIdParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias GetByIdValidationException = GetByIdParamsValidationError;

// ## DELETE ## //
@doc("When goodsReceipt not found")
@error
model DeleteGoodsReceiptNotFoundError extends ApiNotFoundException<"goodsReceiptNotFound"> {
  @statusCode statusCode: 404;
}

alias DeleteNotFoundException = DeleteGoodsReceiptNotFoundError;

@doc("When input params is invalid")
@error
model DeleteParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias DeleteValidationException = DeleteParamsValidationError;
