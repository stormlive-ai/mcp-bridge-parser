import { describe, it } from "node:test"
import { strict as assert } from "node:assert"
import { parseOpenApiSpec, parseSpecObject } from "./dist/index.mjs"

describe("mcp-bridge-parser", () => {
  it("parses a minimal OpenAPI spec from a YAML string", () => {
    const result = parseOpenApiSpec(`
      openapi: "3.0.0"
      info:
        title: Test API
        version: "1.0.0"
      paths:
        /items:
          get:
            summary: List items
            operationId: listItems
            responses:
              "200":
                description: OK
    `)
    assert.ok(result.mcpServers)
    assert.ok(result.mcpServers.test_api)
    assert.equal(result.mcpServers.test_api.tools.length, 1)
    assert.equal(result.mcpServers.test_api.tools[0].name, "list_items")
  })

  it("parses a spec from a JSON string", () => {
    const result = parseOpenApiSpec(JSON.stringify({
      openapi: "3.0.0",
      info: { title: "JSON API", version: "1.0.0" },
      paths: {
        "/users": {
          get: { summary: "Get users", operationId: "getUsers" },
        },
      },
    }))
    assert.equal(result.mcpServers.json_api.tools.length, 1)
  })

  it("parses a spec from a pre-parsed object", () => {
    const result = parseSpecObject({
      openapi: "3.0.0",
      info: { title: "Object API", version: "1.0.0" },
      paths: {
        "/ping": {
          get: { summary: "Health check", operationId: "healthCheck" },
        },
      },
    })
    assert.equal(result.mcpServers.object_api.tools[0].name, "health_check")
  })

  it("handles paths with parameters", () => {
    const result = parseOpenApiSpec({
      openapi: "3.0.0",
      info: { title: "Params API", version: "1.0.0" },
      paths: {
        "/users/{id}": {
          get: {
            summary: "Get user by ID",
            operationId: "getUserById",
            parameters: [
              { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
          },
        },
      },
    })
    const tool = result.mcpServers.params_api.tools[0]
    assert.ok(tool.inputSchema.properties.id)
    assert.equal(tool.inputSchema.properties.id.type, "string")
  })

  it("parses all OpenAPI operation methods", () => {
    const result = parseOpenApiSpec({
      openapi: "3.0.0",
      info: { title: "Methods API", version: "1.0.0" },
      paths: {
        "/items": {
          get: { summary: "Get items" },
          put: { summary: "Put items" },
          post: { summary: "Post items" },
          delete: { summary: "Delete items" },
          options: { summary: "Options items" },
          head: { summary: "Head items" },
          patch: { summary: "Patch items" },
          trace: { summary: "Trace items" },
        },
      },
    })
    const names = result.mcpServers.methods_api.tools.map((tool) => tool.name)
    assert.deepEqual(names, [
      "get_items",
      "put_items",
      "post_items",
      "delete_items",
      "options_items",
      "head_items",
      "patch_items",
      "trace_items",
    ])
  })

  it("throws on invalid input", () => {
    assert.throws(() => parseOpenApiSpec("not valid"))
    assert.throws(() => parseOpenApiSpec({}))
    assert.throws(() => parseOpenApiSpec({ paths: {} }))
  })

  it("handles request body schemas", () => {
    const result = parseOpenApiSpec({
      openapi: "3.0.0",
      info: { title: "Create API", version: "1.0.0" },
      paths: {
        "/items": {
          post: {
            summary: "Create item",
            operationId: "createItem",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Item name" },
                      price: { type: "number", description: "Item price" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    const props = result.mcpServers.create_api.tools[0].inputSchema.properties
    assert.ok(props["body.name"])
    assert.ok(props["body.price"])
  })
})
