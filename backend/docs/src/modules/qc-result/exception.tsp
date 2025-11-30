import "@typespec/http";
import "../../utils/exceptions.tsp";

using TypeSpec.Http;
using api.Utils.Exception;

namespace api.QCResult;

// ## CREATE ## //
@doc("When qcResult not found")
@error
model CreateNotFoundError extends ApiNotFoundException<"qcResultNotFound"> {
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

@doc("When qcResult already exists")
@error
model CreateExistConflictError extends ApiConflictException<"qcResultExists"> {
  @statusCode statusCode: 409;
}

alias CreateConflictException = CreateExistConflictError;

// ## UPDATE ## //
@doc("When qcResult not found")
@error
model UpdateQcResultNotFoundError extends ApiNotFoundException<"qcResultNotFound"> {
  @statusCode statusCode: 404;
}

alias UpdateNotFoundException = UpdateQcResultNotFoundError;

@doc("When input params is invalid")
@error
model UpdateParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias UpdateValidationException = UpdateParamsValidationError;

@doc("When qcResult already exists")
@error
model UpdateExistConflictError extends ApiConflictException<"qcResultExists"> {
  @statusCode statusCode: 409;
}

alias UpdateConflictException = UpdateExistConflictError;

// ## GET BY ID ## //
@doc("When qcResult not found")
@error
model GetByIdQcResultNotFoundError extends ApiNotFoundException<"qcResultNotFound"> {
  @statusCode statusCode: 404;
}

alias GetByIdQcResultNotFoundException = GetByIdQcResultNotFoundError;

@doc("When input params is invalid")
@error
model GetByIdParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias GetByIdValidationException = GetByIdParamsValidationError;

// ## DELETE ## //
@doc("When qcResult not found")
@error
model DeleteQcResultNotFoundError extends ApiNotFoundException<"qcResultNotFound"> {
  @statusCode statusCode: 404;
}

alias DeleteNotFoundException = DeleteQcResultNotFoundError;

@doc("When input params is invalid")
@error
model DeleteParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias DeleteValidationException = DeleteParamsValidationError;
