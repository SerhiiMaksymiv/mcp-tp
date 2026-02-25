import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class MCPClient extends Client {
  public tools: Tool[] = []
  public servers: Map<string, McpServer> = new Map()

  constructor() {
    super({
      name: "mcp-tp-client",
      version: "1.0.0",
    })
  }

  async initialize() {
    try {
      await this.connect(new StdioClientTransport({
        command: "node",
        args: ["build/src/mcp/init.js"]
      }))
      console.log('Connected to MCP Code Server');
    } catch (error) {
      console.error("Error connecting to MCP Code Server:", error);
    }

    const response = await this.listTools();
    this.tools = response.tools;
  }
}
