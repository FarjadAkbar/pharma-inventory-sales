import "@typespec/http";
import "../../utils/exceptions.tsp";

using TypeSpec.Http;
using api.Utils.Exception;

namespace api.Supplier;

// ## CREATE ## //
@doc("When supplier not found")
@error
model CreateNotFoundError extends ApiNotFoundException<"supplierNotFound"> {
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

@doc("When supplier already exists")
@error
model CreateExistConflictError extends ApiConflictException<"supplierExists"> {
  @statusCode statusCode: 409;
}

alias CreateConflictException = CreateExistConflictError;

// ## UPDATE ## //
@doc("When supplier not found")
@error
model UpdateSupplierNotFoundError extends ApiNotFoundException<"supplierNotFound"> {
  @statusCode statusCode: 404;
}

alias UpdateNotFoundException = UpdateSupplierNotFoundError;

@doc("When input params is invalid")
@error
model UpdateParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias UpdateValidationException = UpdateParamsValidationError;

@doc("When supplier already exists")
@error
model UpdateExistConflictError extends ApiConflictException<"supplierExists"> {
  @statusCode statusCode: 409;
}

alias UpdateConflictException = UpdateExistConflictError;

// ## GET BY ID ## //
@doc("When supplier not found")
@error
model GetByIdSupplierNotFoundError extends ApiNotFoundException<"supplierNotFound"> {
  @statusCode statusCode: 404;
}

alias GetByIdSupplierNotFoundException = GetByIdSupplierNotFoundError;

@doc("When input params is invalid")
@error
model GetByIdParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias GetByIdValidationException = GetByIdParamsValidationError;

// ## DELETE ## //
@doc("When supplier not found")
@error
model DeleteSupplierNotFoundError extends ApiNotFoundException<"supplierNotFound"> {
  @statusCode statusCode: 404;
}

alias DeleteNotFoundException = DeleteSupplierNotFoundError;

@doc("When input params is invalid")
@error
model DeleteParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias DeleteValidationException = DeleteParamsValidationError;
