import "@typespec/http";
import "../../utils/exceptions.tsp";

using TypeSpec.Http;
using api.Utils.Exception;

namespace api.QcTest;

// ## CREATE ## //
@doc("When qcTest not found")
@error
model CreateNotFoundError extends ApiNotFoundException<"qcTestNotFound"> {
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

@doc("When qcTest already exists")
@error
model CreateExistConflictError extends ApiConflictException<"qcTestExists"> {
  @statusCode statusCode: 409;
}

alias CreateConflictException = CreateExistConflictError;

// ## UPDATE ## //
@doc("When qcTest not found")
@error
model UpdateQcTestNotFoundError extends ApiNotFoundException<"qcTestNotFound"> {
  @statusCode statusCode: 404;
}

alias UpdateNotFoundException = UpdateQcTestNotFoundError;

@doc("When input params is invalid")
@error
model UpdateParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias UpdateValidationException = UpdateParamsValidationError;

@doc("When qcTest already exists")
@error
model UpdateExistConflictError extends ApiConflictException<"qcTestExists"> {
  @statusCode statusCode: 409;
}

alias UpdateConflictException = UpdateExistConflictError;

// ## GET BY ID ## //
@doc("When qcTest not found")
@error
model GetByIdQcTestNotFoundError extends ApiNotFoundException<"qcTestNotFound"> {
  @statusCode statusCode: 404;
}

alias GetByIdQcTestNotFoundException = GetByIdQcTestNotFoundError;

@doc("When input params is invalid")
@error
model GetByIdParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias GetByIdValidationException = GetByIdParamsValidationError;

// ## DELETE ## //
@doc("When qcTest not found")
@error
model DeleteQcTestNotFoundError extends ApiNotFoundException<"qcTestNotFound"> {
  @statusCode statusCode: 404;
}

alias DeleteNotFoundException = DeleteQcTestNotFoundError;

@doc("When input params is invalid")
@error
model DeleteParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias DeleteValidationException = DeleteParamsValidationError;
