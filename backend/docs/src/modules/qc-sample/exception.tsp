import "@typespec/http";
import "../../utils/exceptions.tsp";

using TypeSpec.Http;
using api.Utils.Exception;

namespace api.QCSample;

// ## CREATE ## //
@doc("When qcSample not found")
@error
model CreateNotFoundError extends ApiNotFoundException<"qcSampleNotFound"> {
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

@doc("When qcSample already exists")
@error
model CreateExistConflictError extends ApiConflictException<"qcSampleExists"> {
  @statusCode statusCode: 409;
}

alias CreateConflictException = CreateExistConflictError;

// ## UPDATE ## //
@doc("When qcSample not found")
@error
model UpdateQcSampleNotFoundError extends ApiNotFoundException<"qcSampleNotFound"> {
  @statusCode statusCode: 404;
}

alias UpdateNotFoundException = UpdateQcSampleNotFoundError;

@doc("When input params is invalid")
@error
model UpdateParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias UpdateValidationException = UpdateParamsValidationError;

@doc("When qcSample already exists")
@error
model UpdateExistConflictError extends ApiConflictException<"qcSampleExists"> {
  @statusCode statusCode: 409;
}

alias UpdateConflictException = UpdateExistConflictError;

// ## GET BY ID ## //
@doc("When qcSample not found")
@error
model GetByIdQcSampleNotFoundError extends ApiNotFoundException<"qcSampleNotFound"> {
  @statusCode statusCode: 404;
}

alias GetByIdQcSampleNotFoundException = GetByIdQcSampleNotFoundError;

@doc("When input params is invalid")
@error
model GetByIdParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias GetByIdValidationException = GetByIdParamsValidationError;

// ## DELETE ## //
@doc("When qcSample not found")
@error
model DeleteQcSampleNotFoundError extends ApiNotFoundException<"qcSampleNotFound"> {
  @statusCode statusCode: 404;
}

alias DeleteNotFoundException = DeleteQcSampleNotFoundError;

@doc("When input params is invalid")
@error
model DeleteParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias DeleteValidationException = DeleteParamsValidationError;
