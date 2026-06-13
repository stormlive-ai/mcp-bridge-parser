export interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface McpServerConfig {
  command: string
  args: string[]
  env: Record<string, string>
  tools: McpTool[]
}

export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>
}

export interface OpenApiSpec {
  openapi?: string
  swagger?: string
  info?: { title?: string; version?: string; description?: string }
  paths?: Record<string, Record<string, unknown>>
}
