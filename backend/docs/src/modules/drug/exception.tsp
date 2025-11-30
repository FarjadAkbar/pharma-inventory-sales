import "@typespec/http";
import "../../utils/exceptions.tsp";

using TypeSpec.Http;
using api.Utils.Exception;

namespace api.Drug;

// ## CREATE ## //
@doc("When drug not found")
@error
model CreateNotFoundError extends ApiNotFoundException<"drugNotFound"> {
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

@doc("When drug already exists")
@error
model CreateExistConflictError extends ApiConflictException<"drugExists"> {
  @statusCode statusCode: 409;
}

alias CreateConflictException = CreateExistConflictError;

// ## UPDATE ## //
@doc("When drug not found")
@error
model UpdateDrugNotFoundError extends ApiNotFoundException<"drugNotFound"> {
  @statusCode statusCode: 404;
}

alias UpdateNotFoundException = UpdateDrugNotFoundError;

@doc("When input params is invalid")
@error
model UpdateParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias UpdateValidationException = UpdateParamsValidationError;

@doc("When drug already exists")
@error
model UpdateExistConflictError extends ApiConflictException<"drugExists"> {
  @statusCode statusCode: 409;
}

alias UpdateConflictException = UpdateExistConflictError;

// ## GET BY ID ## //
@doc("When drug not found")
@error
model GetByIdDrugNotFoundError extends ApiNotFoundException<"drugNotFound"> {
  @statusCode statusCode: 404;
}

alias GetByIdDrugNotFoundException = GetByIdDrugNotFoundError;

@doc("When input params is invalid")
@error
model GetByIdParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias GetByIdValidationException = GetByIdParamsValidationError;

// ## DELETE ## //
@doc("When drug not found")
@error
model DeleteDrugNotFoundError extends ApiNotFoundException<"drugNotFound"> {
  @statusCode statusCode: 404;
}

alias DeleteNotFoundException = DeleteDrugNotFoundError;

@doc("When input params is invalid")
@error
model DeleteParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias DeleteValidationException = DeleteParamsValidationError;
