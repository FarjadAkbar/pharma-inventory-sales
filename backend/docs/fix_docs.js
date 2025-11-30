const fs = require('fs');
const path = require('path');

const modules = [
  'supplier',
  'raw-material',
  'qc-test',
  'qc-sample',
  'qc-result',
  'qa-release',
  'purchase-order',
  'goods-receipt',
  'drug'
];

const template = `import "@typespec/http";
import "../../utils/exceptions.tsp";

using TypeSpec.Http;
using api.Utils.Exception;

namespace api.{{Namespace}};

// ## CREATE ## //
@doc("When {{entity}} not found")
@error
model CreateNotFoundError extends ApiNotFoundException<"{{entity}}NotFound"> {
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

@doc("When {{entity}} already exists")
@error
model CreateExistConflictError extends ApiConflictException<"{{entity}}Exists"> {
  @statusCode statusCode: 409;
}

alias CreateConflictException = CreateExistConflictError;

// ## UPDATE ## //
@doc("When {{entity}} not found")
@error
model Update{{Entity}}NotFoundError extends ApiNotFoundException<"{{entity}}NotFound"> {
  @statusCode statusCode: 404;
}

alias UpdateNotFoundException = Update{{Entity}}NotFoundError;

@doc("When input params is invalid")
@error
model UpdateParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias UpdateValidationException = UpdateParamsValidationError;

@doc("When {{entity}} already exists")
@error
model UpdateExistConflictError extends ApiConflictException<"{{entity}}Exists"> {
  @statusCode statusCode: 409;
}

alias UpdateConflictException = UpdateExistConflictError;

// ## GET BY ID ## //
@doc("When {{entity}} not found")
@error
model GetById{{Entity}}NotFoundError extends ApiNotFoundException<"{{entity}}NotFound"> {
  @statusCode statusCode: 404;
}

alias GetById{{Entity}}NotFoundException = GetById{{Entity}}NotFoundError;

@doc("When input params is invalid")
@error
model GetByIdParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias GetByIdValidationException = GetByIdParamsValidationError;

// ## DELETE ## //
@doc("When {{entity}} not found")
@error
model Delete{{Entity}}NotFoundError extends ApiNotFoundException<"{{entity}}NotFound"> {
  @statusCode statusCode: 404;
}

alias DeleteNotFoundException = Delete{{Entity}}NotFoundError;

@doc("When input params is invalid")
@error
model DeleteParamsValidationError extends ApiBadRequestException<"id: Required"> {
  @statusCode statusCode: 400;
}

alias DeleteValidationException = DeleteParamsValidationError;
`;

function toPascalCase(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function toCamelCase(str) {
    return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

modules.forEach(mod => {
  const dir = path.join(__dirname, 'src/modules', mod);
  const exceptionFile = path.join(dir, 'exception.tsp');
  const controllerFile = path.join(dir, 'controller.tsp');

  const namespace = toPascalCase(mod);
  const entity = toCamelCase(mod);
  const Entity = toPascalCase(mod);

  const content = template
    .replace(/{{Namespace}}/g, namespace)
    .replace(/{{entity}}/g, entity)
    .replace(/{{Entity}}/g, Entity);

  fs.writeFileSync(exceptionFile, content);
  console.log(`Created ${exceptionFile}`);

  let controllerContent = fs.readFileSync(controllerFile, 'utf8');
  
  if (!controllerContent.includes('import "./exception.tsp";')) {
    controllerContent = controllerContent.replace(
      'import "./model.tsp";',
      'import "./model.tsp";\nimport "./exception.tsp";'
    );
  }

  // Fix GetByIdUserNotFoundException
  controllerContent = controllerContent.replace(
    /GetByIdUserNotFoundException/g,
    `GetById${Entity}NotFoundException`
  );

  fs.writeFileSync(controllerFile, controllerContent);
  console.log(`Updated ${controllerFile}`);
});
