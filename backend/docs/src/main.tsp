import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";
import "@typespec/versioning";
import "./modules/login/controller.tsp";
import "./modules/user/controller.tsp";
import "./modules/role/controller.tsp";
import "./modules/reset-password/controller.tsp";
import "./modules/permission/controller.tsp";
import "./modules/logout/controller.tsp";
import "./modules/health/controller.tsp";
import "./modules/supplier/controller.tsp";
import "./modules/drug/controller.tsp";
import "./modules/raw-material/controller.tsp";
import "./modules/purchase-order/controller.tsp";
import "./modules/goods-receipt/controller.tsp";
import "./modules/qc-test/controller.tsp";
import "./modules/qc-sample/controller.tsp";
import "./modules/qc-result/controller.tsp";
import "./modules/qa-release/controller.tsp";
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
