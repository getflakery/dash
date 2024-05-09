/**
 * webserver
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 0.1.0
 * 
 *
 * NOTE: This file is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the file manually.
 */

import * as api from "./api"
import { Configuration } from "./configuration"

const config: Configuration = {}

describe("DefaultApi", () => {
  let instance: api.DefaultApi
  beforeEach(function() {
    instance = new api.DefaultApi(config)
  });

  test("handlersCreateListenerCreateListener", () => {
    const body: api.CreateListenerInput = undefined
    return expect(instance.handlersCreateListenerCreateListener(body, {})).resolves.toBe(null)
  })
  test("handlersDeployDeployAwsCreate", () => {
    const body: api.DeployAWSInput = undefined
    return expect(instance.handlersDeployDeployAwsCreate(body, {})).resolves.toBe(null)
  })
  test("handlersLogLog", () => {
    const body: api.LogInput = undefined
    return expect(instance.handlersLogLog(body, {})).resolves.toBe(null)
  })
})
