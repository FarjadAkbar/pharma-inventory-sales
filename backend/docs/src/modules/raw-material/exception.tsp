import "@typespec/http";
import "../../utils/exceptions.tsp";

using TypeSpec.Http;
using api.Utils.Exception;

namespace api.RawMaterial;

// ## CREATE ## //
@doc("When rawMaterial not found")
@error
model CreateNotFoundError extends ApiNotFoundException<"rawMaterialNotFound"> {
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

@doc("When rawMaterial already exists")
@error
model CreateExistConflictError extends ApiConflictException<"rawMaterialExists"> {
  @statusCode statusCode: 409;
}

alias CreateConflictException = CreateExistConflictError;

// ## UPDATE ## //
@doc("When rawMaterial not found")
@error
model UpdateRawMaterialNotFoundError extends ApiNotFoundException<"rawMaterialNotFound"> {
  @statusCode statusCode: 404;
}

alias UpdateNotFoundException = UpdateRawMaterialNotFoundError;

@doc("When input params is invalid")
@error
model UpdateParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias UpdateValidationException = UpdateParamsValidationError;

@doc("When rawMaterial already exists")
@error
model UpdateExistConflictError extends ApiConflictException<"rawMaterialExists"> {
  @statusCode statusCode: 409;
}

alias UpdateConflictException = UpdateExistConflictError;

// ## GET BY ID ## //
@doc("When rawMaterial not found")
@error
model GetByIdRawMaterialNotFoundError extends ApiNotFoundException<"rawMaterialNotFound"> {
  @statusCode statusCode: 404;
}

alias GetByIdRawMaterialNotFoundException = GetByIdRawMaterialNotFoundError;

@doc("When input params is invalid")
@error
model GetByIdParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias GetByIdValidationException = GetByIdParamsValidationError;

// ## DELETE ## //
@doc("When rawMaterial not found")
@error
model DeleteRawMaterialNotFoundError extends ApiNotFoundException<"rawMaterialNotFound"> {
  @statusCode statusCode: 404;
}

alias DeleteNotFoundException = DeleteRawMaterialNotFoundError;

@doc("When input params is invalid")
@error
model DeleteParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias DeleteValidationException = DeleteParamsValidationError;
