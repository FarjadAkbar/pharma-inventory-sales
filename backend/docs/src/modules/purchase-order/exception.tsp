import "@typespec/http";
import "../../utils/exceptions.tsp";

using TypeSpec.Http;
using api.Utils.Exception;

namespace api.PurchaseOrder;

// ## CREATE ## //
@doc("When purchaseOrder not found")
@error
model CreateNotFoundError extends ApiNotFoundException<"purchaseOrderNotFound"> {
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

@doc("When purchaseOrder already exists")
@error
model CreateExistConflictError extends ApiConflictException<"purchaseOrderExists"> {
  @statusCode statusCode: 409;
}

alias CreateConflictException = CreateExistConflictError;

// ## UPDATE ## //
@doc("When purchaseOrder not found")
@error
model UpdatePurchaseOrderNotFoundError extends ApiNotFoundException<"purchaseOrderNotFound"> {
  @statusCode statusCode: 404;
}

alias UpdateNotFoundException = UpdatePurchaseOrderNotFoundError;

@doc("When input params is invalid")
@error
model UpdateParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias UpdateValidationException = UpdateParamsValidationError;

@doc("When purchaseOrder already exists")
@error
model UpdateExistConflictError extends ApiConflictException<"purchaseOrderExists"> {
  @statusCode statusCode: 409;
}

alias UpdateConflictException = UpdateExistConflictError;

// ## GET BY ID ## //
@doc("When purchaseOrder not found")
@error
model GetByIdPurchaseOrderNotFoundError extends ApiNotFoundException<"purchaseOrderNotFound"> {
  @statusCode statusCode: 404;
}

alias GetByIdPurchaseOrderNotFoundException = GetByIdPurchaseOrderNotFoundError;

@doc("When input params is invalid")
@error
model GetByIdParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias GetByIdValidationException = GetByIdParamsValidationError;

// ## DELETE ## //
@doc("When purchaseOrder not found")
@error
model DeletePurchaseOrderNotFoundError extends ApiNotFoundException<"purchaseOrderNotFound"> {
  @statusCode statusCode: 404;
}

alias DeleteNotFoundException = DeletePurchaseOrderNotFoundError;

@doc("When input params is invalid")
@error
model DeleteParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias DeleteValidationException = DeleteParamsValidationError;
