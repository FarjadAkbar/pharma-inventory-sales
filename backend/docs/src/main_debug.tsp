import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";
import "@typespec/versioning";
import "./modules/deviation/controller.tsp";

using TypeSpec.Http;
using Utils.Versioning;
using TypeSpec.Versioning;

@service({
  title: "Microservice API",
  contact: {
    name: "API Support",
    email: "mike.rodrigues.lima@gmail.com",
  },
  license: {
    name: "MIT",
    url: "https://opensource.org/license/mit",
  },
})
@server("http://localhost:4000/")
@versioned(DocVersionVersion)
namespace api;
