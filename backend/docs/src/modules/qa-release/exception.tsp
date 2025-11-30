import "@typespec/http";
import "../../utils/exceptions.tsp";

using TypeSpec.Http;
using api.Utils.Exception;

namespace api.QaRelease;

// ## CREATE ## //
@doc("When qaRelease not found")
@error
model CreateNotFoundError extends ApiNotFoundException<"qaReleaseNotFound"> {
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

@doc("When qaRelease already exists")
@error
model CreateExistConflictError extends ApiConflictException<"qaReleaseExists"> {
  @statusCode statusCode: 409;
}

alias CreateConflictException = CreateExistConflictError;

// ## UPDATE ## //
@doc("When qaRelease not found")
@error
model UpdateQaReleaseNotFoundError extends ApiNotFoundException<"qaReleaseNotFound"> {
  @statusCode statusCode: 404;
}

alias UpdateNotFoundException = UpdateQaReleaseNotFoundError;

@doc("When input params is invalid")
@error
model UpdateParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias UpdateValidationException = UpdateParamsValidationError;

@doc("When qaRelease already exists")
@error
model UpdateExistConflictError extends ApiConflictException<"qaReleaseExists"> {
  @statusCode statusCode: 409;
}

alias UpdateConflictException = UpdateExistConflictError;

// ## GET BY ID ## //
@doc("When qaRelease not found")
@error
model GetByIdQaReleaseNotFoundError extends ApiNotFoundException<"qaReleaseNotFound"> {
  @statusCode statusCode: 404;
}

alias GetByIdQaReleaseNotFoundException = GetByIdQaReleaseNotFoundError;

@doc("When input params is invalid")
@error
model GetByIdParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias GetByIdValidationException = GetByIdParamsValidationError;

// ## DELETE ## //
@doc("When qaRelease not found")
@error
model DeleteQaReleaseNotFoundError extends ApiNotFoundException<"qaReleaseNotFound"> {
  @statusCode statusCode: 404;
}

alias DeleteNotFoundException = DeleteQaReleaseNotFoundError;

@doc("When input params is invalid")
@error
model DeleteParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias DeleteValidationException = DeleteParamsValidationError;
