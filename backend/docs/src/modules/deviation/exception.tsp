import "@typespec/http";
import "../../utils/exceptions.tsp";

using TypeSpec.Http;
using api.Utils.Exception;

namespace api.Deviation;

// ## CREATE ## //
@doc("When deviation not found")
@error
model CreateNotFoundError extends ApiNotFoundException<"deviationNotFound"> {
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

@doc("When deviation already exists")
@error
model CreateExistConflictError extends ApiConflictException<"deviationExists"> {
  @statusCode statusCode: 409;
}

alias CreateConflictException = CreateExistConflictError;

// ## UPDATE ## //
@doc("When deviation not found")
@error
model UpdateDeviationNotFoundError extends ApiNotFoundException<"deviationNotFound"> {
  @statusCode statusCode: 404;
}

alias UpdateNotFoundException = UpdateDeviationNotFoundError;

@doc("When input params is invalid")
@error
model UpdateParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias UpdateValidationException = UpdateParamsValidationError;

@doc("When deviation already exists")
@error
model UpdateExistConflictError extends ApiConflictException<"deviationExists"> {
  @statusCode statusCode: 409;
}

alias UpdateConflictException = UpdateExistConflictError;

// ## GET BY ID ## //
@doc("When deviation not found")
@error
model GetByIdDeviationNotFoundError extends ApiNotFoundException<"deviationNotFound"> {
  @statusCode statusCode: 404;
}

alias GetByIdDeviationNotFoundException = GetByIdDeviationNotFoundError;

@doc("When input params is invalid")
@error
model GetByIdParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias GetByIdValidationException = GetByIdParamsValidationError;

// ## DELETE ## //
@doc("When deviation not found")
@error
model DeleteDeviationNotFoundError extends ApiNotFoundException<"deviationNotFound"> {
  @statusCode statusCode: 404;
}

alias DeleteNotFoundException = DeleteDeviationNotFoundError;

@doc("When input params is invalid")
@error
model DeleteParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias DeleteValidationException = DeleteParamsValidationError;
