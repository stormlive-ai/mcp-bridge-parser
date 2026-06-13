# mcp-bridge-parser

**Convert any OpenAPI 3.x spec to a ready-to-use Model Context Protocol (MCP) server configuration. Works in Node.js, browser, and Deno — zero network requests, zero dependencies (except js-yaml).**

[![npm version](https://img.shields.io/npm/v/mcp-bridge-parser)](https://www.npmjs.com/package/mcp-bridge-parser)
[![npm downloads](https://img.shields.io/npm/dm/mcp-bridge-parser)](https://www.npmjs.com/package/mcp-bridge-parser)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/stormlive-ai/mcp-bridge-parser?style=social)](https://github.com/stormlive-ai/mcp-bridge-parser)

**[mcpbridge.org](https://mcpbridge.org)** — Try the live converter, browse 1000+ API configs, and access hosted MCP endpoints.

---

## Features

- **Works everywhere** — Node.js, browser, Deno, Bun (no `fs` or `http` dependencies)
- **JSON + YAML** — parses both OpenAPI formats automatically
- **Zero network** — all processing is local; no data leaves your machine
- **TypeScript** — full type definitions bundled
- **Tree-shakeable** — import only what you need (ESM + CJS)
- **Tiny** — ~2.7 KB gzipped

## Install

```bash
npm install mcp-bridge-parser
```

```bash
yarn add mcp-bridge-parser
```

```bash
pnpm add mcp-bridge-parser
```

```bash
bun add mcp-bridge-parser
```

## Quick Start

```ts
import { parseOpenApiSpec } from "mcp-bridge-parser"

const config = parseOpenApiSpec(`
openapi: "3.0.0"
info:
  title: My API
  version: "1.0.0"
paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      responses:
        "200":
          description: User list
`)

console.log(config.mcpServers.my_api.tools[0].name)
// => "list_users"
```

### From a JSON object

```ts
import { parseSpecObject } from "mcp-bridge-parser"

const spec = {
  openapi: "3.0.0",
  info: { title: "Stripe API", version: "2024-01-01" },
  paths: {
    "/v1/customers": {
      get: { summary: "List customers", operationId: "listCustomers" },
    },
  },
}

const config = parseSpecObject(spec)
// config.mcpServers.stripe_api.tools[0] — ready for Claude Desktop, Cursor, etc.
```

### Try it online

Paste any OpenAPI spec at [mcpbridge.org/convert](https://mcpbridge.org/convert) — the converter runs entirely in your browser.

---

## API

### `parseOpenApiSpec(input: string | Record<string, unknown>): McpConfig`

Parses an OpenAPI spec (JSON string, YAML string, or JavaScript object) and returns an MCP configuration object. Throws if the input is not valid OpenAPI.

| Parameter | Type | Description |
|-----------|------|-------------|
| `input` | `string \| Record<string, unknown>` | OpenAPI 3.x spec as JSON, YAML, or pre-parsed object |

### `parseSpecObject(spec: Record<string, unknown>): McpConfig`

Parses a pre-parsed OpenAPI spec object. Useful when you've already loaded and validated the spec elsewhere.

### Return type: `McpConfig`

```ts
interface McpConfig {
  mcpServers: Record<string, McpServerConfig>
}

interface McpServerConfig {
  command: string
  args: string[]
  env: Record<string, string>
  tools: McpTool[]
}

interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}
```

The output is compatible with:
- **Claude Desktop** — drop it in `claude_desktop_config.json`
- **Cursor** — use as an MCP server in `.cursor/mcp.json`
- **VS Code** — use with the MCP extension
- **Any MCP client** — the standard `mcpServers` format

---

## Use Cases

### AI Agent Tool Integration
Give your AI agent (Claude, GPT, Copilot) access to any REST API by converting its OpenAPI spec to an MCP server configuration. The agent gets structured tool definitions with input schemas automatically.

### Quick Prototyping
During API development, rapidly generate MCP configs to test your endpoints with AI clients without writing boilerplate.

### CI/CD Pipelines
Use `mcp-bridge-parser` in your build pipeline to auto-generate MCP configs from your API specs on every deploy.

---

## About MCP-Bridge

`mcp-bridge-parser` is the core parsing engine behind [MCP-Bridge](https://mcpbridge.org), a complete platform for the MCP ecosystem:

- **Converter** — browser-based OpenAPI → MCP tool (free)
- **Config URL Registry** — 1000+ APIs with permanent, fetchable config URLs
- **Hosted Endpoints** — turn any OpenAPI spec into a live MCP endpoint ($5/mo)
- **Bundled Stacks** — pre-configured API + cursor rules combos ($15/mo)
- **Directory** — searchable index of 1000+ MCP-ready APIs

---

## License

MIT — see [LICENSE](LICENSE).

---

Built by [stormlive-ai](https://github.com/stormlive-ai).  
Website: [mcpbridge.org](https://mcpbridge.org)
