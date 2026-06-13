import yaml from "js-yaml"
import type { McpConfig, McpTool, OpenApiSpec } from "./types"

export function parseSpecObject(spec: Record<string, unknown>): McpConfig {
  if (!spec.openapi && !spec.swagger && !spec.paths) {
    throw new Error("Not a valid OpenAPI spec (missing openapi/swagger version or paths)")
  }

  const openApiSpec = spec as OpenApiSpec
  const paths = openApiSpec.paths || {}
  const info = openApiSpec.info || {}
  const apiName = (info.title || "my-api")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")

  const tools: McpTool[] = []

  for (const [path, methods] of Object.entries(paths)) {
    if (!methods || typeof methods !== "object") continue

    for (const method of ["get", "post", "put", "delete", "patch"]) {
      const op = methods[method] as Record<string, unknown> | undefined
      if (!op) continue

      const summary = (op.summary as string) || `${method.toUpperCase()} ${path}`
      const toolName = summary
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")

      const parameters = (op.parameters as Record<string, unknown>[]) || []
      const properties: Record<string, unknown> = {}

      for (const param of parameters) {
        const pName = param.name as string
        properties[pName] = {
          type: ((param.schema as Record<string, unknown>)?.type as string) || "string",
          description: (param.description as string) || "",
        }
      }

      const requestBody = op.requestBody as Record<string, unknown> | undefined
      if (requestBody) {
        const content = requestBody.content as Record<string, unknown> | undefined
        if (content) {
          for (const contentType of Object.keys(content)) {
            const schema = (content[contentType] as Record<string, unknown>)?.schema as Record<string, unknown> | undefined
            if (schema?.properties) {
              for (const [key, val] of Object.entries(schema.properties as Record<string, unknown>)) {
                const prop = val as Record<string, unknown>
                properties[`body.${key}`] = {
                  type: (prop.type as string) || "string",
                  description: (prop.description as string) || "",
                }
              }
            }
          }
        }
      }

      tools.push({
        name: toolName || `endpoint_${tools.length + 1}`,
        description: summary,
        inputSchema: {
          type: "object",
          properties: Object.keys(properties).length > 0
            ? properties
            : { params: { type: "object", description: `Parameters for ${method.toUpperCase()} ${path}` } },
        },
      })
    }
  }

  return {
    mcpServers: {
      [apiName]: {
        command: "npx",
        args: ["-y", `@mcp/${apiName}`],
        env: {},
        tools,
      },
    },
  }
}

export function parseOpenApiSpec(input: string | Record<string, unknown>): McpConfig {
  if (typeof input === "string") {
    const trimmed = input.trim()
    let spec: Record<string, unknown>

    try {
      spec = JSON.parse(trimmed)
    } catch {
      spec = yaml.load(trimmed) as Record<string, unknown>
    }

    if (!spec || typeof spec !== "object") {
      throw new Error("Invalid input. Please provide a valid OpenAPI spec.")
    }

    return parseSpecObject(spec)
  }

  return parseSpecObject(input)
}
